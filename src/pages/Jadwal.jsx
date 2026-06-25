import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { formatTime } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Pencil, X, Calendar, AlertTriangle } from 'lucide-react';

const dayOptions = [
  { value: 'Senin', label: 'Senin' },
  { value: 'Selasa', label: 'Selasa' },
  { value: 'Rabu', label: 'Rabu' },
  { value: 'Kamis', label: 'Kamis' },
  { value: 'Jumat', label: 'Jumat' },
  { value: 'Sabtu', label: 'Sabtu' },
];

const hariIndo = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const tipeOptions = [
  { value: 'kuliah', label: 'Kuliah' },
  { value: 'praktikum', label: 'Praktikum' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'responsi', label: 'Responsi' },
];

const tipeColors = {
  kuliah: 'bg-blue-100 text-blue-700',
  praktikum: 'bg-orange-100 text-orange-700',
  seminar: 'bg-purple-100 text-purple-700',
  responsi: 'bg-green-100 text-green-700',
};

export default function Jadwal() {
  const { addToast } = useToast();
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterHari, setFilterHari] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    hari: '',
    mata_kuliah: '',
    jam_mulai: '',
    jam_selesai: '',
    ruang: '',
    dosen: '',
    tipe: 'kuliah',
  });
  const [submitting, setSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const conflictTimer = useRef(null);

  useEffect(() => {
    fetchJadwal();
  }, [filterHari]);

  async function fetchJadwal() {
    setLoading(true);
    try {
      const params = {};
      if (filterHari) params.hari = filterHari;
      const res = await api.get('/jadwal', { params });
      setJadwal(res.data);
    } catch {
      setJadwal([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (conflictTimer.current) clearTimeout(conflictTimer.current);
    if (!form.hari || !form.jam_mulai || !form.jam_selesai) {
      setConflicts([]);
      return;
    }
    setCheckingConflict(true);
    conflictTimer.current = setTimeout(async () => {
      try {
        const res = await api.get('/jadwal/check-conflict', {
          params: {
            hari: form.hari,
            jam_mulai: form.jam_mulai,
            jam_selesai: form.jam_selesai,
            exclude_id: editItem?.id || undefined,
          },
        });
        setConflicts(res.data.conflicts || []);
      } catch {
        setConflicts([]);
      } finally {
        setCheckingConflict(false);
      }
    }, 400);
    return () => {
      if (conflictTimer.current) clearTimeout(conflictTimer.current);
    };
  }, [form.hari, form.jam_mulai, form.jam_selesai, editItem?.id]);

  function openAdd() {
    setEditItem(null);
    setForm({ hari: '', mata_kuliah: '', jam_mulai: '', jam_selesai: '', ruang: '', dosen: '', tipe: 'kuliah' });
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      hari: item.hari,
      mata_kuliah: item.mata_kuliah,
      jam_mulai: item.jam_mulai,
      jam_selesai: item.jam_selesai,
      ruang: item.ruang || '',
      dosen: item.dosen || '',
      tipe: item.tipe || 'kuliah',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.hari || !form.mata_kuliah || !form.jam_mulai || !form.jam_selesai) {
      addToast('Harap isi semua field wajib', 'error');
      return;
    }
    setSubmitting(true);
    try {
      let res;
      if (editItem) {
        res = await api.put(`/jadwal/${editItem.id}`, form);
        addToast('Jadwal berhasil diperbarui', 'success');
      } else {
        res = await api.post('/jadwal', form);
        addToast('Jadwal berhasil ditambahkan', 'success');
      }
      if (res.data.conflicts?.length > 0) {
        addToast('Perhatian: jadwal bentrok dengan ' + res.data.conflicts.map(c => c.mata_kuliah).join(', '), 'warning');
      }
      setModalOpen(false);
      setConflicts([]);
      fetchJadwal();
    } catch {
      addToast('Gagal menyimpan jadwal', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await api.delete(`/jadwal/${deleteId}`);
      addToast('Jadwal berhasil dihapus', 'success');
      setDeleteId(null);
      fetchJadwal();
    } catch {
      addToast('Gagal menghapus jadwal', 'error');
    }
  }

  const grouped = {};
  hariIndo.forEach((h) => {
    const items = jadwal.filter((j) => j.hari === h);
    if (items.length) grouped[h] = items;
  });

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Jadwal Kuliah</h1>
          <p className="text-text-secondary text-sm mt-0.5">Kelola jadwal perkuliahan Anda</p>
        </div>
        <Button onClick={openAdd}>+ Tambah Jadwal</Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select
            options={dayOptions}
            placeholder="Semua Hari"
            value={filterHari}
            onChange={(e) => setFilterHari(e.target.value)}
            className="sm:w-44"
          />
          {filterHari && (
            <Button variant="ghost" size="sm" onClick={() => setFilterHari('')}>
              Reset
            </Button>
          )}
        </div>
      </Card>

      {Object.keys(grouped).length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Calendar size={48} className="text-text-muted" />}
            title="Belum ada jadwal"
            description="Tambahkan jadwal kuliah Anda sekarang."
            action={<Button onClick={openAdd}>Tambah Jadwal</Button>}
          />
        </Card>
      ) : (
        Object.entries(grouped).map(([hari, items]) => (
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
                  <div className="flex gap-1.5 items-center">
                    {j.tipe && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tipeColors[j.tipe] || tipeColors.kuliah}`}>
                        {tipeOptions.find(o => o.value === j.tipe)?.label || j.tipe}
                      </span>
                    )}
                    {j.is_group_schedule === 1 && j.group_name && (
                      <Badge variant="warning">{j.group_name}</Badge>
                    )}
                    {j.ruang && <Badge>{j.ruang}</Badge>}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(j)}
                      className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary-bg rounded-lg transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(j.id)}
                      className="p-1.5 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal Add/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Jadwal' : 'Tambah Jadwal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Hari"
            options={dayOptions}
            placeholder="Pilih hari"
            value={form.hari}
            onChange={(e) => setForm({ ...form, hari: e.target.value })}
          />
          <Input
            label="Mata Kuliah"
            placeholder="Nama mata kuliah"
            value={form.mata_kuliah}
            onChange={(e) => setForm({ ...form, mata_kuliah: e.target.value })}
          />
          <Input
            label="Dosen (opsional)"
            placeholder="Nama dosen"
            value={form.dosen}
            onChange={(e) => setForm({ ...form, dosen: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Mulai"
              type="time"
              value={form.jam_mulai}
              onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={form.jam_selesai}
              onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })}
            />
          </div>
          {conflicts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-700">Bentrok dengan jadwal lain:</p>
                <ul className="mt-1 space-y-1">
                  {conflicts.map((c) => (
                    <li key={c.id} className="text-sm text-orange-600">
                      {c.mata_kuliah} ({c.jam_mulai} - {c.jam_selesai})
                      {c.ruang ? ` · ${c.ruang}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {checkingConflict && (
            <p className="text-xs text-text-muted">Memeriksa bentrok...</p>
          )}
          <Select
            label="Tipe Kelas"
            options={tipeOptions}
            value={form.tipe}
            onChange={(e) => setForm({ ...form, tipe: e.target.value })}
          />
          <Input
            label="Ruang (opsional)"
            placeholder="Nama ruangan"
            value={form.ruang}
            onChange={(e) => setForm({ ...form, ruang: e.target.value })}
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
        title="Hapus Jadwal"
        size="sm"
      >
        <p className="text-text-secondary text-sm mb-6">
          Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.
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
