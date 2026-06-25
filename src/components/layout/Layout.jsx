import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import InstallPrompt from '../InstallPrompt';
import { Wifi, WifiOff } from 'lucide-react';

export default function Layout() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setShowOnline(true);
      setTimeout(() => setShowOnline(false), 3000);
    };
    const goOffline = () => {
      setOnline(false);
      setShowOnline(false);
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const barHeight = !online ? 'mt-[68px]' : showOnline ? 'mt-[68px]' : 'mt-16';

  return (
    <div className="min-h-screen bg-bg-page">
      {!online && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-center text-xs font-medium py-1.5 flex items-center justify-center gap-1.5">
          <WifiOff size={14} /> Kamu sedang offline — data mungkin tidak terbaru
        </div>
      )}
      {showOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-500 text-white text-center text-xs font-medium py-1.5 flex items-center justify-center gap-1.5 animate-slide-down">
          <Wifi size={14} /> Kembali online
        </div>
      )}
      <Sidebar />
      <Navbar />
      <main className={`${barHeight} ml-[260px] p-6`}>
        <Outlet />
      </main>
      <InstallPrompt />
    </div>
  );
}
