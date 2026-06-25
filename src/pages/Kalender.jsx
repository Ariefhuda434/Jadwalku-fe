import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addHours, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../api/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { id };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(BigCalendar);

function eventStyleGetter(event) {
  if (event.is_group) {
    return { style: { backgroundColor: '#f97316', border: 'none', borderRadius: '8px', opacity: 0.9 } };
  }
  if (event.is_tugas) {
    return { style: { backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', opacity: 0.9 } };
  }
  return { style: { backgroundColor: '#0891b2', border: 'none', borderRadius: '8px' } };
}

export default function Kalender() {
  const { addToast } = useToast();
  const [jadwal, setJadwal] = useState([]);
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/jadwal'), api.get('/tugas')])
      .then(([jRes, tRes]) => {
        setJadwal(jRes.data);
        setTugas(tRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const events = useMemo(() => {
    const result = [];
    const dayOrder = { Minggu: 0, Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6 };
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    if (view === Views.MONTH) {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      for (const day of days) {
        const dayName = dayNames[day.getDay()];
        for (const j of jadwal) {
          if (j.hari !== dayName) continue;
          const [sh, sm] = (j.jam_mulai || '00:00').split(':').map(Number);
          const [eh, em] = (j.jam_selesai || '00:00').split(':').map(Number);
          const start = new Date(day); start.setHours(sh, sm);
          const end = new Date(day); end.setHours(eh, em);

          result.push({
            id: `j-${j.id}-${format(day, 'yyyy-MM-dd')}`,
            title: j.mata_kuliah + (j.ruang ? ` (${j.ruang})` : ''),
            start,
            end: end <= start ? addHours(end, 1) : end,
            resource: j,
            is_group: !!j.is_group_schedule,
            is_tugas: false,
            dbId: j.id,
            type: 'jadwal',
          });
        }
      }
    } else {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      for (const j of jadwal) {
        const dayIndex = dayOrder[j.hari] ?? 0;
        const baseDate = addDays(weekStart, dayIndex);
        const [sh, sm] = (j.jam_mulai || '00:00').split(':').map(Number);
        const [eh, em] = (j.jam_selesai || '00:00').split(':').map(Number);
        const start = new Date(baseDate); start.setHours(sh, sm);
        const end = new Date(baseDate); end.setHours(eh, em);

        result.push({
          id: `j-${j.id}-${format(baseDate, 'yyyy-MM-dd')}`,
          title: j.mata_kuliah + (j.ruang ? ` (${j.ruang})` : ''),
          start,
          end: end <= start ? addHours(end, 1) : end,
          resource: j,
          is_group: !!j.is_group_schedule,
          is_tugas: false,
          dbId: j.id,
          type: 'jadwal',
        });
      }
    }

    for (const t of tugas) {
      if (!t.deadline) continue;
      const d = new Date(t.deadline + 'T23:59:00');
      result.push({
        id: `t-${t.id}`,
        title: t.judul + (t.mata_kuliah ? ` - ${t.mata_kuliah}` : ''),
        start: d,
        end: d,
        allDay: true,
        resource: t,
        is_group: false,
        is_tugas: true,
        dbId: t.id,
        type: 'tugas',
      });
    }

    return result;
  }, [jadwal, tugas, date, view]);

  const onEventDrop = useCallback(async ({ event, start, end }) => {
    if (event.is_group || event.is_tugas) return;

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const hari = dayNames[start.getDay()];
    const jam_mulai = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
    const jam_selesai = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

    try {
      await api.put(`/jadwal/${event.dbId}`, { hari, jam_mulai, jam_selesai });

      setJadwal((prev) =>
        prev.map((j) =>
          j.id === event.dbId ? { ...j, hari, jam_mulai, jam_selesai } : j
        )
      );
    } catch {
      addToast('Gagal mengubah jadwal.', 'error');
    }
  }, [addToast]);

  const onEventResize = useCallback(async ({ event, start, end }) => {
    if (event.is_group || event.is_tugas) return;

    const jam_mulai = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
    const jam_selesai = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

    try {
      await api.put(`/jadwal/${event.dbId}`, { jam_mulai, jam_selesai });

      setJadwal((prev) =>
        prev.map((j) =>
          j.id === event.dbId ? { ...j, jam_mulai, jam_selesai } : j
        )
      );
    } catch {
      addToast('Gagal mengubah jadwal.', 'error');
    }
  }, [addToast]);

  const onSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/jadwal/${deleteId}`);
      setJadwal((prev) => prev.filter((j) => j.id !== deleteId));
      addToast('Jadwal berhasil dihapus', 'success');
      setSelectedEvent(null);
    } catch {
      addToast('Gagal menghapus jadwal', 'error');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  }

  const formatTime = (d) => format(d, 'HH:mm');

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Kalender</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Drag & drop jadwal untuk mengubah waktu. Jadwal grup ({' '}
            <Badge variant="warning">oranye</Badge> ) tidak bisa di-drag.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-4">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 650 }}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          onSelectEvent={onSelectEvent}
          resizable
          eventPropGetter={eventStyleGetter}
          draggableAccessor={(event) => !event.is_group && !event.is_tugas}
          popup
          messages={{
            next: 'Berikutnya',
            previous: 'Sebelumnya',
            today: 'Hari Ini',
            month: 'Bulan',
            week: 'Minggu',
            day: 'Hari',
            agenda: 'Agenda',
            date: 'Tanggal',
            time: 'Waktu',
            event: 'Kegiatan',
            noEventsInRange: 'Tidak ada kegiatan',
          }}
          formats={{
            weekdayFormat: (date) => format(date, 'EEE', { locale: id }),
            monthHeaderFormat: (date) => format(date, 'MMMM yyyy', { locale: id }),
            dayHeaderFormat: (date) => format(date, "EEEE, dd MMMM yyyy", { locale: id }),
          }}
        />
      </div>

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Detail Jadwal" size="sm">
        {selectedEvent && (
          <div>
            {selectedEvent.is_tugas ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-secondary">Tugas</p>
                  <p className="font-medium text-text-primary">{selectedEvent.resource?.judul}</p>
                </div>
                {selectedEvent.resource?.mata_kuliah && (
                  <div>
                    <p className="text-xs text-text-secondary">Mata Kuliah</p>
                    <p className="text-text-primary">{selectedEvent.resource.mata_kuliah}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-text-secondary">Deadline</p>
                  <p className="text-text-primary">{format(selectedEvent.start, 'dd MMMM yyyy', { locale: id })}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-secondary">Mata Kuliah</p>
                  <p className="font-medium text-text-primary">{selectedEvent.resource?.mata_kuliah}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Hari</p>
                  <p className="text-text-primary">{selectedEvent.resource?.hari}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Waktu</p>
                  <p className="text-text-primary">{selectedEvent.resource?.jam_mulai} - {selectedEvent.resource?.jam_selesai}</p>
                </div>
                {selectedEvent.resource?.ruang && (
                  <div>
                    <p className="text-xs text-text-secondary">Ruang</p>
                    <p className="text-text-primary">{selectedEvent.resource.ruang}</p>
                  </div>
                )}
                {selectedEvent.resource?.dosen && (
                  <div>
                    <p className="text-xs text-text-secondary">Dosen</p>
                    <p className="text-text-primary">{selectedEvent.resource.dosen}</p>
                  </div>
                )}
                {selectedEvent.is_group && (
                  <div>
                    <Badge variant="warning">Jadwal Grup</Badge>
                  </div>
                )}
              </div>
            )}

            {!selectedEvent.is_tugas && !selectedEvent.is_group && (
              <div className="mt-6 pt-4 border-t border-border">
                <Button variant="danger" onClick={() => { setDeleteId(selectedEvent.dbId); setSelectedEvent(null); }} className="w-full">
                  Hapus Jadwal
                </Button>
              </div>
            )}

            {selectedEvent.is_group && (
              <p className="mt-4 text-xs text-text-secondary text-center">
                Hapus jadwal grup melalui halaman grup.
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Jadwal"
        message="Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
