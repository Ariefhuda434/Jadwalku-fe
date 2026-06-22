import { useState, useEffect } from 'react';
import api from '../api/axios';
import { getMonthDays, getMonthName, formatTime, formatDate } from '../utils/helpers';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const dayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function Kalender() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [jadwal, setJadwal] = useState([]);
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/jadwal'), api.get('/tugas')])
      .then(([jRes, tRes]) => {
        setJadwal(jRes.data);
        setTugas(tRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cells = getMonthDays(year, month);

  function getJadwalForDate(day) {
    if (!day) return [];
    const date = new Date(year, month, day);
    const dayName = dayHeaders[date.getDay() === 0 ? 6 : date.getDay() - 1];
    return jadwal.filter((j) => j.hari === dayName);
  }

  function getTugasForDate(day) {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tugas.filter((t) => t.deadline && t.deadline.startsWith(dateStr));
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDate(null);
  }

  const today = new Date();
  const todayDate = today.getDate();
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

  const selectedDetail = selectedDate ? {
    day: selectedDate,
    jadwal: getJadwalForDate(selectedDate),
    tugas: getTugasForDate(selectedDate),
    dateObj: new Date(year, month, selectedDate),
  } : null;

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Kalender</h1>
          <p className="text-text-secondary text-sm mt-0.5">Lihat jadwal dan deadline dalam kalender</p>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-page transition-all text-lg"
          >
            ‹
          </button>
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            {getMonthName(month)} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-page transition-all text-lg"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
          {dayHeaders.map((d) => (
            <div key={d} className="bg-bg-page px-2 py-2.5 text-center text-xs font-semibold text-text-secondary">
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="bg-white px-2 py-3 min-h-[90px]" />;
            const isToday = isCurrentMonth && d === todayDate;
            const jCount = getJadwalForDate(d).length;
            const tCount = getTugasForDate(d).length;
            const isSelected = selectedDate === d;

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`bg-white px-2 py-3 min-h-[90px] text-left transition-all hover:bg-primary-bg/50 relative ${
                  isSelected ? 'ring-2 ring-primary ring-inset bg-primary-bg' : ''
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                    isToday ? 'bg-primary text-white font-semibold' : 'text-text-primary'
                  }`}
                >
                  {d}
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {jCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-primary" title={`${jCount} jadwal`} />
                  )}
                  {tCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-accent-urgent" title={`${tCount} tugas`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Detail Panel */}
      {selectedDetail && (
        <Card className="mt-6 p-5 animate-slide-up">
          <h3 className="font-heading font-semibold text-text-primary mb-1">
            {selectedDetail.dateObj.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h3>

          {selectedDetail.jadwal.length === 0 && selectedDetail.tugas.length === 0 ? (
            <EmptyState
              title="Tidak ada kegiatan"
              description="Tidak ada jadwal atau deadline di tanggal ini"
              icon="📭"
            />
          ) : (
            <div className="mt-4 space-y-4">
              {selectedDetail.jadwal.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>☰</span> Jadwal
                  </h4>
                  <div className="space-y-2">
                    {selectedDetail.jadwal.map((j, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-primary-bg/50">
                        <div className="text-center min-w-[52px]">
                          <p className="text-xs font-semibold text-primary">{formatTime(j.jam_mulai)}</p>
                          <p className="text-[10px] text-text-muted">{formatTime(j.jam_selesai)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{j.mata_kuliah}</p>
                          {(j.dosen || j.ruang) && (
                            <p className="text-xs text-text-secondary">
                              {j.dosen}{j.dosen && j.ruang && ' · '}{j.ruang}
                            </p>
                          )}
                        </div>
                        {j.ruang && <Badge>{j.ruang}</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDetail.tugas.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-accent-urgent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>☑</span> Deadline Tugas
                  </h4>
                  <div className="space-y-2">
                    {selectedDetail.tugas.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/50">
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] ${
                          t.status === 'selesai' ? 'bg-success border-success text-white' : 'border-text-muted'
                        }`}>
                          {t.status === 'selesai' && '✓'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${t.status === 'selesai' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                            {t.judul}
                          </p>
                          {t.mata_kuliah && (
                            <p className="text-xs text-text-secondary">{t.mata_kuliah}</p>
                          )}
                        </div>
                        {t.prioritas === 'tinggi' && <Badge variant="danger">Tinggi</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
