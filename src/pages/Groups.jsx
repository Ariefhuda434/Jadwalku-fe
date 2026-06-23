import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import { Plus, Users, UserPlus, LogIn } from 'lucide-react';

export default function Groups() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Nama grup wajib diisi', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/groups', form);
      addToast('Grup berhasil dibuat', 'success');
      setCreateOpen(false);
      setForm({ name: '', description: '' });
      navigate(`/grup/${res.data.id}`);
    } catch {
      addToast('Gagal membuat grup', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!inviteCode.trim()) {
      addToast('Kode undangan wajib diisi', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/groups/join', { invite_code: inviteCode.trim() });
      addToast('Berhasil bergabung ke grup', 'success');
      setJoinOpen(false);
      setInviteCode('');
      navigate(`/grup/${res.data.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal bergabung', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Grup Kuliah</h1>
          <p className="text-text-secondary text-sm mt-0.5">Kelola grup kelas dan berbagi jadwal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJoinOpen(true)} icon={<LogIn size={16} />}>
            Gabung
          </Button>
          <Button onClick={() => setCreateOpen(true)} icon={<Plus size={16} />}>
            Buat Grup
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Users size={48} className="text-text-muted" />}
            title="Belum ada grup"
            description="Buat grup baru atau gabung dengan kode undangan dari komting kamu."
            action={
              <div className="flex gap-2">
                <Button onClick={() => setCreateOpen(true)}>Buat Grup</Button>
                <Button variant="outline" onClick={() => setJoinOpen(true)}>Gabung Grup</Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Card
              key={g.id}
              className="p-5"
              onClick={() => navigate(`/grup/${g.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading font-semibold text-text-primary">{g.name}</h3>
                <Badge variant={g.my_role === 'admin' ? 'default' : 'success'}>
                  {g.my_role === 'admin' ? 'Admin' : 'Anggota'}
                </Badge>
              </div>
              {g.description && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{g.description}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Users size={14} />
                <span>{g.member_count} anggota</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Buat Grup Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nama Grup"
            placeholder="Contoh: TI-2023 A"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Deskripsi (opsional)"
            placeholder="Deskripsi grup"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Membuat...' : 'Buat Grup'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={joinOpen} onClose={() => setJoinOpen(false)} title="Gabung Grup" size="sm">
        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            label="Kode Undangan"
            placeholder="Masukkan kode undangan"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <p className="text-xs text-text-secondary">
            Minta kode undangan dari admin grup untuk bergabung.
          </p>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Bergabung...' : 'Gabung'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setJoinOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
