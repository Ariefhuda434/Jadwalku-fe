import { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

export default function CreateSemesterModal({ open, onClose, onCreated, semesters }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [copyFromId, setCopyFromId] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    setLoading(true);
    try {
      await onCreated({ name, start_date: startDate, end_date: endDate, copy_from_id: copyFromId || undefined });
      setName('');
      setStartDate('');
      setEndDate('');
      setCopyFromId('');
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Semester Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nama Semester" value={name} onChange={e => setName(e.target.value)} placeholder="contoh: Ganjil 2025/2026" required />
        <Input label="Tanggal Mulai" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        <Input label="Tanggal Selesai" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />

        {semesters.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salin dari Semester Sebelumnya (opsional)</label>
            <select
              value={copyFromId}
              onChange={e => setCopyFromId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Jangan salin</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Jadwal pribadi & tugas akan disalin (deadline tugas diatur +14 hari dari hari ini).</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
        </div>
      </form>
    </Modal>
  );
}
