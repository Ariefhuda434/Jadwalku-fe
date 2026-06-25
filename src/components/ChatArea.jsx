import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Input from './ui/Input';
import LoadingSpinner from './ui/LoadingSpinner';
import { Send } from 'lucide-react';

export default function ChatArea({ groupId }) {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [groupId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (String(msg.group_id) === String(groupId)) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
      }
    };
    socket.on('group:chat:message', handler);
    return () => socket.off('group:chat:message', handler);
  }, [socket, groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length]);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/chat`);
      setMessages(res.data);
      setHasMore(res.data.length >= 50);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[0];
      const res = await api.get(`/groups/${groupId}/chat`, {
        params: { before: oldest.id, limit: 50 }
      });
      if (res.data.length < 50) setHasMore(false);
      setMessages((prev) => [...res.data, ...prev]);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/groups/${groupId}/chat`, { message: text.trim() });
      setText('');
    } catch {
      // handled by interceptor
    } finally {
      setSending(false);
    }
  }

  function handleScroll() {
    const el = containerRef.current;
    if (el && el.scrollTop <= 50 && hasMore && !loadingMore) {
      loadMore();
    }
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-12" />;

  return (
    <div className="flex flex-col h-[500px] rounded-xl border border-border bg-white overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {loadingMore && (
          <div className="text-center py-2">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {!hasMore && messages.length > 0 && (
          <p className="text-center text-xs text-text-muted py-2">— Awal percakapan —</p>
        )}
        {messages.length === 0 && !loadingMore && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-muted">Belum ada pesan. Mulai percakapan!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwn ? 'order-1' : 'order-1'}`}>
                {!isOwn && (
                  <p className="text-xs text-text-muted mb-0.5 ml-1">{msg.username}</p>
                )}
                <div
                  className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    isOwn
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-bg-page text-text-primary rounded-bl-md border border-border'
                  }`}
                >
                  {msg.message}
                </div>
                <p className={`text-[10px] text-text-muted mt-0.5 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-white">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 rounded-full bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
