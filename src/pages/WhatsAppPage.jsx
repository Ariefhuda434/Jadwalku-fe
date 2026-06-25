import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Smartphone, RefreshCw, MessageCircle, ScanLine, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function WhatsAppPage() {
  const socket = useSocket();
  const { addToast } = useToast();
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [disconnectConfirm, setDisconnectConfirm] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/whatsapp/status');
      setStatus((prev) => ({ ...prev, ...res.data }));
      if (res.data.qr) setQrCode(res.data.qr);
    } catch {
      setStatus({ status: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!socket) return;
    const handleQR = (dataURL) => { setQrCode(dataURL); setCountdown(30); };
    const handleStatus = (s) => {
      setStatus((prev) => ({ ...prev, status: s }));
      if (s === 'connected') { setQrCode(null); setCountdown(0); }
      if (s === 'disconnected') { setCountdown(0); }
      if (s === 'waiting_scan') fetchStatus();
    };
    socket.on('whatsapp:qr', handleQR);
    socket.on('whatsapp:status', handleStatus);
    return () => {
      socket.off('whatsapp:qr', handleQR);
      socket.off('whatsapp:status', handleStatus);
    };
  }, [socket, fetchStatus]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [countdown]);

  async function handleDisconnect() {
    try {
      await api.post('/whatsapp/disconnect');
      setQrCode(null);
      setCountdown(0);
      setDisconnectConfirm(false);
      addToast('WhatsApp terputus. Scan QR untuk konek ulang.', 'info');
      fetchStatus();
    } catch {
      addToast('Gagal memutus koneksi WhatsApp', 'error');
    }
  }

  const statusLabels = {
    connected: 'Tersambung',
    disconnected: 'Terputus',
    waiting_scan: 'Menunggu Scan QR',
    error: 'Gagal',
  };

  const statusVariants = {
    connected: 'success',
    disconnected: 'danger',
    waiting_scan: 'warning',
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-slide-up max-w-xl mx-auto">
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-primary" /> WhatsApp
      </h1>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-text-primary">Status Koneksi</h2>
          <Badge variant={statusVariants[status?.status] || 'danger'}>
            {statusLabels[status?.status] || 'Tidak Diketahui'}
          </Badge>
        </div>

        <p className="text-sm text-text-secondary mb-4">
          Hubungkan WhatsApp untuk mengirim pengumuman grup otomatis ke nomor anggota.
          Scan QR code di bawah menggunakan WhatsApp kamu.
        </p>

        {status?.status === 'connected' && (
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
            <Smartphone size={32} className="text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success">WhatsApp tersambung!</p>
            <p className="text-xs text-text-secondary mt-1">
              Pengumuman grup akan otomatis dikirim ke WA anggota.
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => setDisconnectConfirm(true)}>
                <LogOut size={14} /> Putuskan Koneksi
              </Button>
            </div>
          </div>
        )}

        {qrCode && (
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl inline-block mb-3 border border-border shadow-sm">
              <img
                src={qrCode}
                alt="QR Code WhatsApp"
                className="mx-auto"
                width={300}
                height={300}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-text-secondary mb-2">
              <ScanLine size={14} />
              <span>Scan QR ini dengan WhatsApp kamu</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <RefreshCw size={12} className={countdown > 0 ? 'animate-spin' : ''} />
              <span className="text-xs text-text-secondary">
                {countdown > 0
                  ? `QR diperbarui otomatis dalam ${countdown}s`
                  : 'Memperbarui QR...'}
              </span>
            </div>
          </div>
        )}

        {status?.status === 'waiting_scan' && !qrCode && (
          <div className="text-center py-6">
            <LoadingSpinner size="md" />
            <p className="text-xs text-text-secondary mt-3">Menghasilkan QR code...</p>
          </div>
        )}

        {status?.status === 'disconnected' && !qrCode && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <Smartphone size={32} className="text-danger mx-auto mb-2" />
            <p className="text-sm font-medium text-danger">WhatsApp terputus</p>
            <p className="text-xs text-text-secondary mt-1">
              {countdown > 0
                ? 'Menyambung kembali...'
                : 'Hubungkan dengan scan QR di atas atau klik tombol di bawah.'}
            </p>
            <div className="mt-3 flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => { setCountdown(1); fetchStatus(); }}>
                <RefreshCw size={14} /> Refresh
              </Button>
              <Button variant="danger" size="sm" onClick={handleDisconnect}>
                <LogOut size={14} /> Reset & Scan Ulang
              </Button>
            </div>
          </div>
        )}

        {status?.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-danger">Gagal mendapatkan status</p>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-heading font-semibold text-text-primary mb-3">Cara Kerja</h2>
        <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
          <li>Pastikan WhatsApp kamu terhubung (scan QR di atas)</li>
          <li>Anggota grup mengisi nomor WA di halaman Profil</li>
          <li>Saat admin membuat pengumuman, otomatis terkirim ke WA anggota</li>
        </ol>
      </Card>
      <ConfirmDialog
        isOpen={disconnectConfirm}
        title="Putuskan Koneksi WhatsApp"
        message="WhatsApp akan terputus dan sesi login akan dihapus. Anda perlu scan QR ulang untuk terhubung kembali."
        confirmText="Putuskan"
        variant="danger"
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnectConfirm(false)}
      />
    </div>
  );
}
