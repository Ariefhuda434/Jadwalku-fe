import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { formatTime, formatDate } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ChatArea from '../components/ChatArea';
import {
  Users, UserMinus, UserPlus, Shield, Copy, RefreshCw,
  Megaphone, CalendarRange, Pencil, X, Plus,
  ArrowLeft, Trash2, LogOut, Crown, ClipboardList, Check, MessageCircle
} from 'lucide-react';

const dayOptions = [
  { value: 'Senin', label: 'Senin' },
  { value: 'Selasa', label: 'Selasa' },
  { value: 'Rabu', label: 'Rabu' },
  { value: 'Kamis', label: 'Kamis' },
  { value: 'Jumat', label: 'Jumat' },
  { value: 'Sabtu', label: 'Sabtu' },
];

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const { addToast } = useToast();

  const [group, setGroup] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [groupJadwal, setGroupJadwal] = useState([]);
  const [groupTugas, setGroupTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');

  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', message: '' });
  const [annSubmitting, setAnnSubmitting] = useState(false);

  const [jadwalModalOpen, setJadwalModalOpen] = useState(false);
  const [editJadwal, setEditJadwal] = useState(null);
  const [jadwalForm, setJadwalForm] = useState({
    hari: '', mata_kuliah: '', jam_mulai: '', jam_selesai: '', ruang: '', dosen: ''
  });
  const [jadwalSubmitting, setJadwalSubmitting] = useState(false);

  const [tugasModalOpen, setTugasModalOpen] = useState(false);
  const [tugasForm, setTugasForm] = useState({
    judul: '', mata_kuliah: '', deskripsi: '', deadline: '', prioritas: 'sedang'
  });
  const [tugasSubmitting, setTugasSubmitting] = useState(false);

  const [deleteJadwalId, setDeleteJadwalId] = useState(null);
  const [deleteAnnId, setDeleteAnnId] = useState(null);
  const [removeMemberId, setRemoveMemberId] = useState(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [changeRoleMemberId, setChangeRoleMemberId] = useState(null);
  const [changeRoleTarget, setChangeRoleTarget] = useState(null);

  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [editGroupForm, setEditGroupForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    socket.on(`group:announcement`, (ann) => {
      if (String(ann.group_id) === String(id)) {
        setAnnouncements((prev) => [ann, ...prev]);
        addToast('Pengumuman baru: ' + ann.title, 'success');
      }
    });

    socket.on(`group:member:join`, (data) => {
      setGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: [...prev.members, { ...data, joined_at: new Date().toISOString() }],
          member_count: prev.member_count + 1,
        };
      });
    });

    socket.on(`group:member:leave`, (data) => {
      setGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.filter((m) => m.id !== data.user_id),
          member_count: prev.member_count - 1,
        };
      });
    });

    socket.on(`group:member:role`, (data) => {
      setGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.id === data.user_id ? { ...m, role: data.role } : m
          ),
        };
      });
    });

    return () => {
      socket.off(`group:announcement`);
      socket.off(`group:member:join`);
      socket.off(`group:member:leave`);
      socket.off(`group:member:role`);
    };
  }, [socket, id]);

  async function fetchData() {
    setLoading(true);
    try {
      const [groupRes, annRes, jadwalRes, tugasRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/announcements`),
        api.get(`/jadwal?group_id=${id}`),
        api.get(`/groups/${id}/tugas`),
      ]);
      setGroup(groupRes.data);
      setAnnouncements(annRes.data);
      setGroupJadwal(jadwalRes.data);
      setGroupTugas(tugasRes.data.tugas || []);
    } catch (err) {
      if (err.response?.status === 404) {
        addToast('Grup tidak ditemukan', 'error');
        navigate('/grup');
      } else {
        addToast('Gagal memuat data grup', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = group?.my_role === 'admin';
  const isSuperAdmin = group?.created_by === user?.id;

  async function copyInviteCode() {
    try {
      const res = await api.get(`/groups/${id}/invite`);
      await navigator.clipboard.writeText(res.data.invite_code);
      addToast('Kode undangan disalin!', 'success');
    } catch {
      addToast('Gagal menyalin kode', 'error');
    }
  }

  async function resetInviteCode() {
    try {
      const res = await api.post(`/groups/${id}/invite/reset`);
      setGroup((prev) => ({ ...prev, invite_code: res.data.invite_code }));
      addToast('Kode undangan berhasil direset', 'success');
    } catch {
      addToast('Gagal mereset kode', 'error');
    }
  }

  async function handleCreateAnnouncement(e) {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.message.trim()) {
      addToast('Judul dan pesan wajib diisi', 'error');
      return;
    }
    setAnnSubmitting(true);
    try {
      await api.post(`/groups/${id}/announcements`, annForm);
      setAnnModalOpen(false);
      setAnnForm({ title: '', message: '' });
      addToast('Pengumuman berhasil dikirim', 'success');
    } catch {
      addToast('Gagal membuat pengumuman', 'error');
    } finally {
      setAnnSubmitting(false);
    }
  }

  async function fetchTugas() {
    try {
      const res = await api.get(`/groups/${id}/tugas`);
      setGroupTugas(res.data.tugas || []);
    } catch {}
  }

  async function handleCreateTugas(e) {
    e.preventDefault();
    if (!tugasForm.judul || !tugasForm.deadline) {
      addToast('Judul dan deadline wajib diisi', 'error');
      return;
    }
    setTugasSubmitting(true);
    try {
      await api.post('/tugas', { ...tugasForm, group_id: parseInt(id) });
      setTugasModalOpen(false);
      setTugasForm({ judul: '', mata_kuliah: '', deskripsi: '', deadline: '', prioritas: 'sedang' });
      addToast('Tugas grup berhasil ditambahkan', 'success');
      fetchTugas();
    } catch {
      addToast('Gagal menambah tugas grup', 'error');
    } finally {
      setTugasSubmitting(false);
    }
  }

  async function handleSubmitTugas(tugasId) {
    try {
      const res = await api.post(`/tugas/${tugasId}/submit`);
      addToast(res.data.status === 'selesai' ? 'Tugas dikumpulkan!' : 'Tugas dibatalkan', 'success');
      fetchTugas();
    } catch {
      addToast('Gagal mengubah status tugas', 'error');
    }
  }

  function openAddJadwal() {
    setEditJadwal(null);
    setJadwalForm({ hari: '', mata_kuliah: '', jam_mulai: '', jam_selesai: '', ruang: '', dosen: '' });
    setJadwalModalOpen(true);
  }

  function openEditJadwal(j) {
    setEditJadwal(j);
    setJadwalForm({
      hari: j.hari, mata_kuliah: j.mata_kuliah,
      jam_mulai: j.jam_mulai, jam_selesai: j.jam_selesai,
      ruang: j.ruang || '', dosen: j.dosen || '',
    });
    setJadwalModalOpen(true);
  }

  async function handleJadwalSubmit(e) {
    e.preventDefault();
    if (!jadwalForm.hari || !jadwalForm.mata_kuliah || !jadwalForm.jam_mulai || !jadwalForm.jam_selesai) {
      addToast('Harap isi semua field wajib', 'error');
      return;
    }
    setJadwalSubmitting(true);
    try {
      const payload = { ...jadwalForm, group_id: parseInt(id) };
      if (editJadwal) {
        await api.put(`/jadwal/${editJadwal.id}`, payload);
        addToast('Jadwal berhasil diperbarui', 'success');
      } else {
        await api.post('/jadwal', payload);
        addToast('Jadwal berhasil ditambahkan', 'success');
      }
      setJadwalModalOpen(false);
      const res = await api.get(`/jadwal?group_id=${id}`);
      setGroupJadwal(res.data);
    } catch {
      addToast('Gagal menyimpan jadwal', 'error');
    } finally {
      setJadwalSubmitting(false);
    }
  }

  async function confirmDeleteJadwal() {
    if (!deleteJadwalId) return;
    try {
      await api.delete(`/jadwal/${deleteJadwalId}`);
      setGroupJadwal((prev) => prev.filter((j) => j.id !== deleteJadwalId));
      addToast('Jadwal berhasil dihapus', 'success');
    } catch {
      addToast('Gagal menghapus jadwal', 'error');
    } finally {
      setDeleteJadwalId(null);
    }
  }

  async function confirmDeleteAnnouncement() {
    if (!deleteAnnId) return;
    try {
      await api.delete(`/groups/${id}/announcements/${deleteAnnId}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== deleteAnnId));
      addToast('Pengumuman berhasil dihapus', 'success');
    } catch {
      addToast('Gagal menghapus pengumuman', 'error');
    } finally {
      setDeleteAnnId(null);
    }
  }

  async function confirmRemoveMember() {
    if (!removeMemberId) return;
    try {
      await api.delete(`/groups/${id}/members/${removeMemberId}`);
      setGroup((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== removeMemberId),
        member_count: prev.member_count - 1,
      }));
      addToast('Anggota berhasil dikeluarkan', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal mengeluarkan anggota', 'error');
    } finally {
      setRemoveMemberId(null);
    }
  }

  async function handleLeaveGroup() {
    try {
      await api.post(`/groups/${id}/leave`);
      addToast('Berhasil keluar dari grup', 'success');
      navigate('/grup');
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal keluar grup', 'error');
    } finally {
      setLeaveConfirm(false);
    }
  }

  async function handleChangeRole(memberId, newRole) {
    try {
      await api.put(`/groups/${id}/members/${memberId}/role`, { role: newRole });
      setGroup((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId ? { ...m, role: newRole } : m
        ),
      }));
      addToast(`Role berhasil diubah menjadi ${newRole === 'admin' ? 'Admin' : 'Anggota'}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal mengubah role', 'error');
    } finally {
      setChangeRoleMemberId(null);
      setChangeRoleTarget(null);
    }
  }

  async function handleEditGroup(e) {
    e.preventDefault();
    try {
      const res = await api.put(`/groups/${id}`, editGroupForm);
      setGroup((prev) => ({ ...prev, ...res.data }));
      setEditGroupOpen(false);
      addToast('Grup berhasil diperbarui', 'success');
    } catch {
      addToast('Gagal memperbarui grup', 'error');
    }
  }

  async function handleDeleteGroup() {
    try {
      await api.delete(`/groups/${id}`);
      addToast('Grup berhasil dihapus', 'success');
      navigate('/grup');
    } catch {
      addToast('Gagal menghapus grup', 'error');
    }
  }

  const sortedJadwal = [...groupJadwal].sort((a, b) => {
    const dayOrder = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 7 };
    const d = (dayOrder[a.hari] || 99) - (dayOrder[b.hari] || 99);
    return d !== 0 ? d : a.jam_mulai.localeCompare(b.jam_mulai);
  });

  const groupedJadwal = {};
  sortedJadwal.forEach((j) => {
    if (!groupedJadwal[j.hari]) groupedJadwal[j.hari] = [];
    groupedJadwal[j.hari].push(j);
  });

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!group) return null;

  return (
    <div className="animate-slide-up">
      <button
        onClick={() => navigate('/grup')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Kembali ke Grup
      </button>

      <Card className="p-5 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-heading text-2xl font-bold text-text-primary">{group.name}</h1>
              {isSuperAdmin ? (
                <Badge variant="default">Super Admin</Badge>
              ) : (
                <Badge variant={isAdmin ? 'default' : 'success'}>
                  {isAdmin ? 'Admin' : 'Anggota'}
                </Badge>
              )}
            </div>
            {group.description && (
              <p className="text-text-secondary text-sm mb-2">{group.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Users size={14} /> {group.member_count} anggota</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {!isSuperAdmin && (
              <Button size="sm" variant="outline" onClick={() => setLeaveConfirm(true)}>
                <LogOut size={14} /> Keluar
              </Button>
            )}
            {isAdmin && (
              <>
                <Button size="sm" variant="outline" onClick={() => {
                  setEditGroupForm({ name: group.name, description: group.description || '' });
                  setEditGroupOpen(true);
                }}>
                  <Pencil size={14} /> Edit
                </Button>
                {isSuperAdmin && (
                  <Button size="sm" variant="danger" onClick={handleDeleteGroup}>
                    <Trash2 size={14} />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {isAdmin && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Kode Undangan:</span>
              <code className="px-3 py-1 bg-bg-page border border-border rounded-lg font-mono font-bold text-primary text-sm tracking-wider">
                {group.invite_code}
              </code>
              <Button size="sm" variant="ghost" onClick={copyInviteCode}>
                <Copy size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={resetInviteCode}>
                <RefreshCw size={14} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
        {[
          { key: 'chat', label: 'Chat', icon: MessageCircle },
          { key: 'announcements', label: 'Pengumuman', icon: Megaphone },
          { key: 'tugas', label: 'Tugas', icon: ClipboardList },
          { key: 'jadwal', label: 'Jadwal', icon: CalendarRange },
          { key: 'members', label: 'Anggota', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'chat' && (
        <ChatArea groupId={id} />
      )}

      {activeTab === 'announcements' && (
        <div>
          {isAdmin && (
            <div className="mb-4">
              <Button onClick={() => setAnnModalOpen(true)} icon={<Megaphone size={16} />}>
                Buat Pengumuman
              </Button>
            </div>
          )}

          {announcements.length === 0 ? (
            <Card className="p-5">
              <EmptyState
                icon={<Megaphone size={48} className="text-text-muted" />}
                title="Belum ada pengumuman"
                description={isAdmin ? 'Buat pengumuman untuk anggota grup.' : 'Belum ada pengumuman dari admin.'}
                action={isAdmin ? <Button onClick={() => setAnnModalOpen(true)}>Buat Pengumuman</Button> : undefined}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <Card key={ann.id} className="p-4" hover={false}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-text-primary">{ann.title}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Oleh {ann.author_name} · {new Date(ann.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {(isAdmin || ann.user_id === user?.id) && (
                      <button
                        onClick={() => setDeleteAnnId(ann.id)}
                        className="p-1 text-text-muted hover:text-danger rounded transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{ann.message}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tugas' && (
        <div>
          {isAdmin && (
            <div className="mb-4">
              <Button onClick={() => {
                setTugasForm({ judul: '', mata_kuliah: '', deskripsi: '', deadline: '', prioritas: 'sedang' });
                setTugasModalOpen(true);
              }} icon={<Plus size={16} />}>
                Tambah Tugas Grup
              </Button>
            </div>
          )}

          {groupTugas.length === 0 ? (
            <Card className="p-5">
              <EmptyState
                icon={<ClipboardList size={48} className="text-text-muted" />}
                title="Belum ada tugas grup"
                description={isAdmin ? 'Buat tugas untuk anggota grup.' : 'Admin belum menambahkan tugas.'}
                action={isAdmin ? <Button onClick={() => setTugasModalOpen(true)}>Tambah Tugas</Button> : undefined}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {groupTugas.map((t) => (
                <Card key={t.id} className="p-4 flex items-start gap-4" hover={false}>
                  <button
                    onClick={() => handleSubmitTugas(t.id)}
                    className={`mt-0.5 min-w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                      t.submission_status === 'selesai'
                        ? 'bg-success border-success text-white'
                        : 'border-text-muted hover:border-primary'
                    }`}
                  >
                    {t.submission_status === 'selesai' && <Check size={12} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-medium ${
                          t.submission_status === 'selesai' ? 'line-through text-text-muted' : 'text-text-primary'
                        }`}>
                          {t.judul}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {t.mata_kuliah && `${t.mata_kuliah}`}{t.mata_kuliah && t.deadline && ' · '}
                          {t.deadline && formatDate(t.deadline)}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Oleh {t.creator_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {t.prioritas === 'tinggi' && <Badge variant="danger">Tinggi</Badge>}
                        {t.prioritas === 'sedang' && <Badge variant="warning">Sedang</Badge>}
                        {t.submission_status === 'selesai' ? (
                          <Badge variant="success">Dikumpul</Badge>
                        ) : (
                          <Badge variant="danger">Belum</Badge>
                        )}
                        <Badge variant="warning">
                          {t.submission_count}/{t.total_members}
                        </Badge>
                      </div>
                    </div>
                    {t.deskripsi && (
                      <p className="text-sm text-text-secondary mt-2">{t.deskripsi}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'jadwal' && (
        <div>
          {isAdmin && (
            <div className="mb-4">
              <Button onClick={openAddJadwal} icon={<Plus size={16} />}>
                Tambah Jadwal Grup
              </Button>
            </div>
          )}

          {sortedJadwal.length === 0 ? (
            <Card className="p-5">
              <EmptyState
                icon={<CalendarRange size={48} className="text-text-muted" />}
                title="Belum ada jadwal grup"
                description={isAdmin ? 'Tambahkan jadwal kuliah untuk dibagikan ke anggota.' : 'Admin belum menambahkan jadwal.'}
                action={isAdmin ? <Button onClick={openAddJadwal}>Tambah Jadwal</Button> : undefined}
              />
            </Card>
          ) : (
            Object.entries(groupedJadwal).map(([hari, items]) => (
              <div key={hari} className="mb-6">
                <h2 className="font-heading font-semibold text-text-primary text-base mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {hari}
                  <span className="text-xs text-text-muted font-normal">({items.length})</span>
                </h2>
                <div className="space-y-2">
                  {items.map((j) => (
                    <Card key={j.id} className="p-4 flex items-center gap-4" hover={false}>
                      <div className="min-w-[90px] text-center">
                        <p className="text-sm font-semibold text-primary">{formatTime(j.jam_mulai)}</p>
                        <p className="text-xs text-text-muted">{formatTime(j.jam_selesai)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary">{j.mata_kuliah}</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {j.dosen && `${j.dosen}`}{j.dosen && j.ruang && ' · '}{j.ruang || ''}
                        </p>
                      </div>
                      {j.ruang && <Badge>{j.ruang}</Badge>}
                      {isAdmin && (
                        <div className="flex gap-1.5">
                          <button onClick={() => openEditJadwal(j)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary-bg rounded-lg transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteJadwalId(j.id)}
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          <Card className="overflow-hidden" hover={false}>
            <div className="divide-y divide-border">
              {group.members?.map((m) => {
                const isSuperAdminMember = m.id === group.created_by;
                return (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${isSuperAdminMember ? 'bg-amber-500' : 'bg-primary'}`}>
                        {isSuperAdminMember ? <Crown size={16} /> : (m.username?.[0]?.toUpperCase() || 'U')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{m.username}</p>
                        <p className="text-xs text-text-secondary">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSuperAdminMember ? (
                        <Badge variant="warning">Super Admin</Badge>
                      ) : (
                        <Badge variant={m.role === 'admin' ? 'default' : 'success'}>
                          {m.role === 'admin' ? 'Admin' : 'Anggota'}
                        </Badge>
                      )}
                      {isAdmin && !isSuperAdminMember && (
                        <>
                          <button
                            onClick={() => {
                              setChangeRoleMemberId(m.id);
                              setChangeRoleTarget(m.role === 'admin' ? 'member' : 'admin');
                            }}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary-bg rounded-lg transition-all"
                            title={m.role === 'admin' ? 'Turunkan jadi Anggota' : 'Jadikan Admin'}
                          >
                            {m.role === 'admin' ? <UserMinus size={16} /> : <UserPlus size={16} />}
                          </button>
                          <button
                            onClick={() => setRemoveMemberId(m.id)}
                            className="p-1.5 text-text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                            title="Keluarkan"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <Modal isOpen={annModalOpen} onClose={() => setAnnModalOpen(false)} title="Buat Pengumuman">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Input
            label="Judul"
            placeholder="Contoh: Perubahan Jadwal"
            value={annForm.title}
            onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-text-primary mb-1.5">Pesan</label>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              rows={4}
              placeholder="Tulis pesan pengumuman..."
              value={annForm.message}
              onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={annSubmitting}>
              {annSubmitting ? 'Mengirim...' : 'Kirim Pengumuman'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setAnnModalOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={tugasModalOpen} onClose={() => setTugasModalOpen(false)} title="Tambah Tugas Grup">
        <form onSubmit={handleCreateTugas} className="space-y-4">
          <Input
            label="Judul Tugas"
            placeholder="Nama tugas"
            value={tugasForm.judul}
            onChange={(e) => setTugasForm({ ...tugasForm, judul: e.target.value })}
          />
          <Input
            label="Mata Kuliah (opsional)"
            placeholder="Nama mata kuliah"
            value={tugasForm.mata_kuliah}
            onChange={(e) => setTugasForm({ ...tugasForm, mata_kuliah: e.target.value })}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-text-primary mb-1.5">Deskripsi (opsional)</label>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              rows={3}
              placeholder="Detail tugas..."
              value={tugasForm.deskripsi}
              onChange={(e) => setTugasForm({ ...tugasForm, deskripsi: e.target.value })}
            />
          </div>
          <Input
            label="Deadline"
            type="date"
            value={tugasForm.deadline}
            onChange={(e) => setTugasForm({ ...tugasForm, deadline: e.target.value })}
          />
          <Select
            label="Prioritas"
            options={[
              { value: 'rendah', label: 'Rendah' },
              { value: 'sedang', label: 'Sedang' },
              { value: 'tinggi', label: 'Tinggi' },
            ]}
            value={tugasForm.prioritas}
            onChange={(e) => setTugasForm({ ...tugasForm, prioritas: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={tugasSubmitting}>
              {tugasSubmitting ? 'Menyimpan...' : 'Tambah Tugas'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setTugasModalOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={jadwalModalOpen}
        onClose={() => setJadwalModalOpen(false)}
        title={editJadwal ? 'Edit Jadwal Grup' : 'Tambah Jadwal Grup'}
      >
        <form onSubmit={handleJadwalSubmit} className="space-y-4">
          <Select
            label="Hari"
            options={dayOptions}
            placeholder="Pilih hari"
            value={jadwalForm.hari}
            onChange={(e) => setJadwalForm({ ...jadwalForm, hari: e.target.value })}
          />
          <Input
            label="Mata Kuliah"
            placeholder="Nama mata kuliah"
            value={jadwalForm.mata_kuliah}
            onChange={(e) => setJadwalForm({ ...jadwalForm, mata_kuliah: e.target.value })}
          />
          <Input
            label="Dosen (opsional)"
            placeholder="Nama dosen"
            value={jadwalForm.dosen}
            onChange={(e) => setJadwalForm({ ...jadwalForm, dosen: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Mulai"
              type="time"
              value={jadwalForm.jam_mulai}
              onChange={(e) => setJadwalForm({ ...jadwalForm, jam_mulai: e.target.value })}
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={jadwalForm.jam_selesai}
              onChange={(e) => setJadwalForm({ ...jadwalForm, jam_selesai: e.target.value })}
            />
          </div>
          <Input
            label="Ruang (opsional)"
            placeholder="Nama ruangan"
            value={jadwalForm.ruang}
            onChange={(e) => setJadwalForm({ ...jadwalForm, ruang: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={jadwalSubmitting}>
              {jadwalSubmitting ? 'Menyimpan...' : editJadwal ? 'Simpan' : 'Tambah'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setJadwalModalOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={editGroupOpen} onClose={() => setEditGroupOpen(false)} title="Edit Grup" size="sm">
        <form onSubmit={handleEditGroup} className="space-y-4">
          <Input
            label="Nama Grup"
            value={editGroupForm.name}
            onChange={(e) => setEditGroupForm({ ...editGroupForm, name: e.target.value })}
          />
          <Input
            label="Deskripsi"
            value={editGroupForm.description}
            onChange={(e) => setEditGroupForm({ ...editGroupForm, description: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Simpan</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditGroupOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteJadwalId}
        title="Hapus Jadwal"
        message="Apakah Anda yakin ingin menghapus jadwal ini? Seluruh anggota grup akan kehilangan akses ke jadwal ini."
        onConfirm={confirmDeleteJadwal}
        onCancel={() => setDeleteJadwalId(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteAnnId}
        title="Hapus Pengumuman"
        message="Apakah Anda yakin ingin menghapus pengumuman ini?"
        onConfirm={confirmDeleteAnnouncement}
        onCancel={() => setDeleteAnnId(null)}
      />

      <ConfirmDialog
        isOpen={!!removeMemberId}
        title="Keluarkan Anggota"
        message="Apakah Anda yakin ingin mengeluarkan anggota ini dari grup?"
        confirmText="Keluarkan"
        onConfirm={confirmRemoveMember}
        onCancel={() => setRemoveMemberId(null)}
      />

      <ConfirmDialog
        isOpen={leaveConfirm}
        title="Keluar dari Grup"
        message="Apakah Anda yakin ingin keluar dari grup ini?"
        confirmText="Keluar"
        variant="danger"
        onConfirm={handleLeaveGroup}
        onCancel={() => setLeaveConfirm(false)}
      />

      <ConfirmDialog
        isOpen={!!changeRoleMemberId}
        title={changeRoleTarget === 'admin' ? 'Jadikan Admin' : 'Turunkan jadi Anggota'}
        message={
          changeRoleTarget === 'admin'
            ? 'Anggota ini akan mendapatkan akses admin grup (membuat pengumuman, mengelola jadwal, mengelola anggota).'
            : 'Admin ini akan diturunkan menjadi anggota biasa dan kehilangan akses admin.'
        }
        confirmText={changeRoleTarget === 'admin' ? 'Jadikan Admin' : 'Turunkan'}
        variant={changeRoleTarget === 'admin' ? 'primary' : 'danger'}
        onConfirm={() => handleChangeRole(changeRoleMemberId, changeRoleTarget)}
        onCancel={() => { setChangeRoleMemberId(null); setChangeRoleTarget(null); }}
      />
    </div>
  );
}
