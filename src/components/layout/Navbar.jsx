import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search } from 'lucide-react';
import NotificationPanel from '../notification/NotificationPanel';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-bg-card border-b border-border flex items-center justify-between px-6 z-40">
      <div className="relative w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Cari jadwal atau tugas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              navigate('/jadwal', { state: { search: searchQuery.trim() } });
              setSearchQuery('');
            }
          }}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-page border border-border text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
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
