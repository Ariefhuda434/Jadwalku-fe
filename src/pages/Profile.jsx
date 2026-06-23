import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { User, Smartphone, Bell, BellOff, Shield, Check } from 'lucide-react';

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { addToast } = useToast();
  const socket = useSocket();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const [vapidKey, setVapidKey] = useState(null);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  const [passForm, setPassForm] = useState({ current_password: '', new_password: '' });
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkPushSupport();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
      setForm({ username: res.data.username, email: res.data.email, phone: res.data.phone || '' });
    } catch {
      addToast('Gagal memuat profil', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function checkPushSupport() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushSupported(false);
      return;
    }
    setPushSupported(true);

    try {
      const keyRes = await api.get('/push/vapid-key');
      setVapidKey(keyRes.data.publicKey);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
    } catch {
      setPushSupported(false);
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  async function togglePush() {
    if (!pushSupported || !vapidKey) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();

      if (existing) {
        await existing.unsubscribe();
        await api.delete('/push/subscribe', { data: { endpoint: existing.endpoint } });
        setPushSubscribed(false);
        addToast('Push notifikasi dimatikan', 'success');
      } else {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        const subJson = subscription.toJSON();
        await api.post('/push/subscribe', {
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        });
        setPushSubscribed(true);
        addToast('Push notifikasi diaktifkan', 'success');
      }
    } catch (err) {
      addToast('Gagal mengubah push notifikasi', 'error');
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/profile', form);
      setProfile(res.data);
      setForm({ username: res.data.username, email: res.data.email, phone: res.data.phone || '' });
      addToast('Profil berhasil diperbarui', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passForm.new_password.length < 6) {
      addToast('Password baru minimal 6 karakter', 'error');
      return;
    }
    setPassSaving(true);
    try {
      await api.put('/profile/password', passForm);
      setPassForm({ current_password: '', new_password: '' });
      addToast('Password berhasil diubah', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal mengubah password', 'error');
    } finally {
      setPassSaving(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Profil</h1>

      <Card className="p-5 mb-6">
        <h2 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <User size={18} className="text-primary" /> Informasi Akun
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            label="Nomor WhatsApp"
            placeholder="6281234567890"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <p className="text-xs text-text-secondary">Nomor WA akan digunakan untuk notifikasi pengumuman grup.</p>
          <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </form>
      </Card>

      <Card className="p-5 mb-6">
        <h2 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Bell size={18} className="text-primary" /> Notifikasi Browser
        </h2>
        {pushSupported ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary font-medium">
                {pushSubscribed ? 'Push notifikasi aktif' : 'Push notifikasi nonaktif'}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {pushSubscribed
                  ? 'Notifikasi akan muncul meskipun browser ditutup.'
                  : 'Aktifkan untuk menerima notifikasi deadline & pengumuman.'}
              </p>
            </div>
            <Button
              variant={pushSubscribed ? 'outline' : 'primary'}
              size="sm"
              onClick={togglePush}
              icon={pushSubscribed ? <BellOff size={16} /> : <Bell size={16} />}
            >
              {pushSubscribed ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Browser tidak mendukung push notifikasi.</p>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Shield size={18} className="text-primary" /> Ubah Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Password Saat Ini"
            type="password"
            value={passForm.current_password}
            onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })}
          />
          <Input
            label="Password Baru"
            type="password"
            value={passForm.new_password}
            onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
          />
          <Button type="submit" disabled={passSaving}>{passSaving ? 'Menyimpan...' : 'Ubah Password'}</Button>
        </form>
      </Card>
    </div>
  );
}
