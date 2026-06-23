import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Smartphone, RefreshCw, MessageCircle } from 'lucide-react';

export default function WhatsAppPage() {
  const { addToast } = useToast();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const res = await api.get('/whatsapp/status');
      setStatus(res.data);
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
    <div className="animate-fade-in max-w-xl mx-auto">
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

        {status?.status === 'waiting_scan' && status?.qr && (
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl inline-block mb-3 border border-border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(status.qr)}`}
                alt="QR Code WhatsApp"
                className="mx-auto"
                width={250}
                height={250}
              />
            </div>
            <p className="text-xs text-text-secondary">
              Scan QR code ini dengan WhatsApp kamu &gt; Menu &gt; Linked Devices
            </p>
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
