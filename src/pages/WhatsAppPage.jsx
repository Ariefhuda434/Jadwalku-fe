import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Smartphone, RefreshCw, MessageCircle, ScanLine } from 'lucide-react';

export default function WhatsAppPage() {
  const socket = useSocket();
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleQR = (dataURL) => { setQrCode(dataURL); };
    const handleStatus = (s) => {
      setStatus((prev) => ({ ...prev, status: s }));
      if (s === 'connected') setQrCode(null);
      if (s === 'disconnected') setQrCode(null);
    };
    socket.on('whatsapp:qr', handleQR);
    socket.on('whatsapp:status', handleStatus);
    return () => {
      socket.off('whatsapp:qr', handleQR);
      socket.off('whatsapp:status', handleStatus);
    };
  }, [socket]);

  useEffect(() => {
    if (qrCode) {
      setCountdown(150);
      const t = setInterval(() => {
        setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [qrCode]);

  async function fetchStatus() {
    try {
      const res = await api.get('/whatsapp/status');
      setStatus(res.data);
      if (res.data.qr) setQrCode(res.data.qr);
    } catch {
      setStatus({ status: 'error' });
    } finally {
      setLoading(false);
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
          </div>
        )}

        {(status?.status === 'waiting_scan' && qrCode) && (
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

        {status?.status === 'disconnected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <Smartphone size={32} className="text-danger mx-auto mb-2" />
            <p className="text-sm font-medium text-danger">WhatsApp terputus</p>
            <p className="text-xs text-text-secondary mt-1">
              Server akan mencoba menyambung kembali secara otomatis.
            </p>
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
    </div>
  );
}
