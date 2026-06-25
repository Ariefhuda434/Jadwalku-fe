import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show || !deferredPrompt) return null;

  async function handleInstall() {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up">
      <div className="bg-white border border-border rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-bg flex items-center justify-center shrink-0">
          <Download size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">Install JadwalKu</p>
          <p className="text-xs text-text-secondary mt-0.5">Akses cepat dari layar utama HP-mu</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShow(false)}
              className="px-3 py-1.5 text-text-secondary text-xs font-medium hover:text-text-primary transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>
        <button onClick={() => setShow(false)} className="p-1 text-text-muted hover:text-text-secondary">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
