import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, ClipboardList } from 'lucide-react';
import NotificationPanel from '../notification/NotificationPanel';
import api from '../../api/axios';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
      setSearchResults(res.data);
    } catch {
      setSearchResults(null);
    }
  }, []);

  function handleSearchInput(e) {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSearch(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  }

  function goTo(route, state) {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults(null);
    navigate(route, state);
  }

  const totalResults = searchResults
    ? searchResults.jadwal.length + searchResults.tugas.length
    : 0;

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-bg-card border-b border-border flex items-center justify-between px-6 z-40">
      <div className="relative w-80" ref={searchRef}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Cari jadwal atau tugas..."
          value={searchQuery}
          onChange={handleSearchInput}
          onFocus={() => { if (searchQuery.trim()) setShowSearch(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              goTo('/jadwal', { search: searchQuery.trim() });
            }
          }}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-page border border-border text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />

        {showSearch && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-border overflow-hidden animate-fade-in">
            {!searchResults ? (
              <div className="px-4 py-3 text-sm text-text-muted">Mencari...</div>
            ) : totalResults === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted">Tidak ditemukan</div>
            ) : (
              <div>
                {searchResults.jadwal.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider bg-bg-page flex items-center gap-1.5">
                      <Calendar size={12} /> Jadwal ({searchResults.jadwal.length})
                    </div>
                    {searchResults.jadwal.slice(0, 3).map((j) => (
                      <button
                        key={`j-${j.id}`}
                        onClick={() => goTo('/jadwal')}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-bg-page/50 transition-colors"
                      >
                        <div className="min-w-[40px] text-center">
                          <p className="text-xs font-semibold text-primary">{j.jam_mulai?.slice(0, 5)}</p>
                          <p className="text-[10px] text-text-muted">{j.hari?.slice(0, 3)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{j.mata_kuliah}</p>
                          <p className="text-xs text-text-secondary truncate">
                            {j.group_name ? `${j.group_name}` : ''}{j.group_name && j.dosen ? ' · ' : ''}{j.dosen || ''}
                          </p>
                        </div>
                      </button>
                    ))}
                    {searchResults.jadwal.length > 3 && (
                      <button
                        onClick={() => goTo('/jadwal', { search: searchQuery })}
                        className="w-full text-center text-xs text-primary py-2 hover:bg-bg-page/50"
                      >
                        Lihat semua ({searchResults.jadwal.length})
                      </button>
                    )}
                  </div>
                )}
                {searchResults.tugas.length > 0 && (
                  <div className="border-t border-border">
                    <div className="px-4 py-2 text-xs font-semibold text-accent-urgent uppercase tracking-wider bg-bg-page flex items-center gap-1.5">
                      <ClipboardList size={12} /> Tugas ({searchResults.tugas.length})
                    </div>
                    {searchResults.tugas.slice(0, 3).map((t) => (
                      <button
                        key={`t-${t.id}`}
                        onClick={() => goTo('/tugas')}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-bg-page/50 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] ${
                          t.status === 'selesai' ? 'bg-success border-success' : 'border-text-muted'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${t.status === 'selesai' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                            {t.judul}
                          </p>
                          <p className="text-xs text-text-secondary truncate">{t.mata_kuliah}</p>
                        </div>
                      </button>
                    ))}
                    {searchResults.tugas.length > 3 && (
                      <button
                        onClick={() => goTo('/tugas', { search: searchQuery })}
                        className="w-full text-center text-xs text-primary py-2 hover:bg-bg-page/50"
                      >
                        Lihat semua ({searchResults.tugas.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <NotificationPanel />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-text-primary hidden sm:block">
              {user?.username || 'User'}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card rounded-xl shadow-lg border border-border py-1 animate-fade-in">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-text-primary">{user?.username}</p>
                <p className="text-xs text-text-secondary">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
