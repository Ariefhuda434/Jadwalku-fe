import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSemester } from '../context/SemesterContext';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DatePicker from '../components/ui/DatePicker';
import { Search, Pencil, Trash2, Check, ClipboardList } from 'lucide-react';

const tabs = ['Semua', 'Aktif', 'Selesai'];
const priorityOptions = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'tinggi', label: 'Tinggi' },
];

export default function Tugas() {
  const { addToast } = useToast();
  const { activeSemester } = useSemester();
  const location = useLocation();
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Semua');
  const [search, setSearch] = useState(location.state?.search || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    judul: '',
    mata_kuliah: '',
    deskripsi: '',
    deadline: '',
    prioritas: 'sedang',
    status: 'pending',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTugas();
  }, [search, activeTab, activeSemester]);

  async function fetchTugas() {
    setLoading(true);
    try {
      const params = {};
      if (activeSemester?.id) params.semester_id = activeSemester.id;
      if (search) params.search = search;
      if (activeTab === 'Aktif') params.status = 'pending';
      else if (activeTab === 'Selesai') params.status = 'selesai';
      const res = await api.get('/tugas', { params });
      setTugas(res.data);
    } catch {
      setTugas([]);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditItem(null);
    setForm({ judul: '', mata_kuliah: '', deskripsi: '', deadline: '', prioritas: 'sedang', status: 'pending' });
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      judul: item.judul,
      mata_kuliah: item.mata_kuliah || '',
      deskripsi: item.deskripsi || '',
      deadline: item.deadline ? item.deadline.slice(0, 10) : '',
      prioritas: item.prioritas || 'sedang',
      status: item.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.judul) {
      addToast('Judul tugas wajib diisi', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (editItem) {
        await api.put(`/tugas/${editItem.id}`, { ...form, semester_id: activeSemester?.id });
        addToast('Tugas berhasil diperbarui', 'success');
      } else {
        await api.post('/tugas', { ...form, semester_id: activeSemester?.id });
        addToast('Tugas berhasil ditambahkan', 'success');
      }
      setModalOpen(false);
      fetchTugas();
    } catch {
      addToast('Gagal menyimpan tugas', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(item) {
    if (item.is_group_task) {
      try {
        const res = await api.post(`/tugas/${item.id}/submit`);
        addToast(res.data.status === 'selesai' ? 'Tugas dikumpulkan!' : 'Tugas dibatalkan', 'success');
        fetchTugas();
      } catch {
        addToast('Gagal mengubah status', 'error');
      }
      return;
    }
    const newStatus = item.status === 'selesai' ? 'pending' : 'selesai';
    try {
      await api.put(`/tugas/${item.id}`, { status: newStatus, semester_id: activeSemester?.id });
      addToast(newStatus === 'selesai' ? 'Tugas selesai!' : 'Tugas diaktifkan kembali', 'success');
      fetchTugas();
    } catch {
      addToast('Gagal mengubah status', 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api.delete(`/tugas/${deleteId}`);
      addToast('Tugas berhasil dihapus', 'success');
      setDeleteId(null);
      fetchTugas();
    } catch {
      addToast('Gagal menghapus tugas', 'error');
    }
  }

  const filtered = tugas;

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Tugas</h1>
          <p className="text-text-secondary text-sm mt-0.5">Kelola tugas kuliah Anda</p>
        </div>
        <Button onClick={openAdd}>+ Tambah Tugas</Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-page border border-border text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-1 bg-bg-page rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-5">
            <EmptyState
              icon={<ClipboardList size={48} className="text-text-muted" />}
              title="Tidak ada tugas"
              description={search ? 'Tidak ditemukan dengan kata kunci tersebut' : 'Belum ada tugas, tambahkan sekarang!'}
              action={<Button onClick={openAdd}>Tambah Tugas</Button>}
            />
          </Card>
        ) : (
          filtered.map((t) => (
            <Card
              key={t.id}
              className={`p-4 flex items-start gap-4 ${t.status === 'selesai' ? 'opacity-70' : ''}`}
              hover={false}
            >
              <button
                onClick={() => toggleStatus(t)}
                className={`mt-0.5 min-w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-xs transition-all duration-200 ${
                  t.status === 'selesai'
                    ? 'bg-success border-success text-white scale-105 rotate-0'
                    : 'border-text-muted hover:border-primary'
                }`}
              >
                {t.status === 'selesai' && <Check size={12} />}
              </button>
              <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-medium ${t.status === 'selesai' || t.submission_status === 'selesai' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                        {t.judul}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {t.mata_kuliah && `${t.mata_kuliah}`}{t.mata_kuliah && t.deadline && ' · '}
                        {t.deadline && formatDate(t.deadline)}
                      </p>
                      {t.is_group_task && (
                        <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                          📋 {t.group_name} · {t.creator_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.prioritas === 'tinggi' && <Badge variant="danger">Tinggi</Badge>}
                      {t.prioritas === 'sedang' && <Badge variant="warning">Sedang</Badge>}
                      {t.prioritas === 'rendah' && <Badge variant="default">Rendah</Badge>}
                      {t.is_group_task ? (
                        t.submission_status === 'selesai' ? <Badge variant="success">Dikumpul</Badge> : <Badge variant="danger">Belum</Badge>
                      ) : (
                        t.status === 'selesai' && <Badge variant="success">Selesai</Badge>
                      )}
                      {!t.is_group_task && (
                        <>
                          <button onClick={() => openEdit(t)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary-bg rounded-lg transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteId(t.id)}
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                {t.deskripsi && t.status !== 'selesai' && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">{t.deskripsi}</p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Add/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Tugas' : 'Tambah Tugas'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Judul Tugas"
            placeholder="Nama tugas"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
          />
          <Input
            label="Mata Kuliah"
            placeholder="Nama mata kuliah"
            value={form.mata_kuliah}
            onChange={(e) => setForm({ ...form, mata_kuliah: e.target.value })}
          />
          <TextArea
            label="Deskripsi (opsional)"
            placeholder="Detail tugas..."
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
          />
          <DatePicker
            label="Deadline"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <Select
            label="Prioritas"
            options={priorityOptions}
            value={form.prioritas}
            onChange={(e) => setForm({ ...form, prioritas: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Menyimpan...' : editItem ? 'Simpan' : 'Tambah'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Tugas"
        size="sm"
      >
        <p className="text-text-secondary text-sm mb-6">
          Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={confirmDelete} className="flex-1">
            Hapus
          </Button>
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
            Batal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
