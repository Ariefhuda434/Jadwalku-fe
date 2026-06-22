import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getGreeting, getTodayDay, getMonthDays, getMonthName, formatTime } from '../utils/helpers';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Calendar, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = getTodayDay();
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch {
      setData({ jadwal_hari_ini: [], tugas_minggu_ini: [] });
    } finally {
      setLoading(false);
    }
  }

  const jadwalToday = data?.jadwal_hari_ini || [];
  const tugasWeek = data?.tugas_minggu_ini || [];

  const calCells = getMonthDays(calYear, calMonth);
  const todayDate = now.getDate();
  const isCurrentMonth = calMonth === now.getMonth() && calYear === now.getFullYear();

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  }

  const sortedTugas = [...tugasWeek].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const top3 = sortedTugas.slice(0, 3);
  const totalTugas = sortedTugas.length;
  const selesaiTugas = sortedTugas.filter((t) => t.status === 'selesai').length;

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="animate-fade-in">
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-1">
        {getGreeting()}, {user?.username || 'User'}!
      </h1>
      <p className="text-text-secondary text-sm mb-6">
        Ini ringkasan aktivitas Anda hari ini.
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 lg:w-2/3 space-y-6">
          {/* Jadwal Hari Ini */}
          <Card className="p-5">
            <h2 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary" /> Jadwal Hari Ini —{' '}
              <span className="text-text-secondary font-normal">{today}</span>
            </h2>
            {jadwalToday.length === 0 ? (
              <EmptyState
                title="Tidak ada jadwal hari ini"
                description="Santai aja, hari ini libur kuliah!"
                icon={<Calendar size={48} className="text-text-muted" />}
              />
            ) : (
              <div className="space-y-3">
                {jadwalToday.map((j, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-bg-page border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="min-w-[60px] text-center">
                      <p className="text-sm font-semibold text-primary">{formatTime(j.jam_mulai)}</p>
                      <p className="text-xs text-text-muted">{formatTime(j.jam_selesai)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary">{j.mata_kuliah}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {j.dosen && `${j.dosen} · `}{j.ruang || ''}
                      </p>
                    </div>
                    {j.ruang && (
                      <Badge variant="default">{j.ruang}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Deadline Tugas Terdekat */}
          <Card className="p-5">
            <h2 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-accent-urgent" /> Deadline Tugas Terdekat
            </h2>
            {sortedTugas.length === 0 ? (
              <EmptyState
                title="Tidak ada tugas"
                description="Semua tugas sudah selesai. Mantap!"
                icon={<CheckCircle size={48} className="text-text-muted" />}
              />
            ) : (
              <div className="space-y-3">
                {sortedTugas.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-page border border-border/50 hover:border-amber-300/50 transition-colors">
                    <span className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                      t.status === 'selesai' ? 'bg-success border-success text-white' : 'border-text-muted'
                    }`}>
                      {t.status === 'selesai' && <Check size={12} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${t.status === 'selesai' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                        {t.judul}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">{t.mata_kuliah}</p>
                    </div>
                    <Badge variant={t.status === 'selesai' ? 'success' : 'warning'}>
                      {t.status === 'selesai' ? 'Selesai' : new Date(t.deadline).toLocaleDateString('id-ID')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:w-1/3 space-y-6">
          {/* Mini Calendar */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="text-text-secondary hover:text-text-primary">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-heading font-semibold text-text-primary text-sm">
                {getMonthName(calMonth)} {calYear}
              </h3>
              <button onClick={nextMonth} className="text-text-secondary hover:text-text-primary">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <div key={d} className="text-xs text-text-muted font-medium py-1">{d}</div>
              ))}
              {calCells.map((d, i) => (
                <div
                  key={i}
                  className={`text-xs py-1.5 rounded-lg ${
                    d && isCurrentMonth && d === todayDate
                      ? 'bg-primary text-white font-semibold'
                      : d
                      ? 'text-text-primary hover:bg-primary-bg'
                      : ''
                  }`}
                >
                  {d || ''}
                </div>
              ))}
            </div>
          </Card>

          {/* Progress Stats */}
          <Card className="p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">Progress Tugas</h3>
            {totalTugas > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-secondary">{selesaiTugas}/{totalTugas} selesai</span>
                  <span className="font-semibold text-text-primary">
                    {Math.round((selesaiTugas / totalTugas) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: `${(selesaiTugas / totalTugas) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-text-muted">Belum ada tugas</p>
            )}
          </Card>

          {/* Deadline Terdekat Top 3 */}
          <Card className="p-5">
            <h3 className="font-heading font-semibold text-text-primary text-sm mb-3">Deadline Terdekat</h3>
            {top3.length === 0 ? (
              <p className="text-sm text-text-muted">Tidak ada deadline</p>
            ) : (
              <div className="space-y-3">
                {top3.map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">{t.judul}</p>
                    </div>
                    <Badge variant="warning" className="ml-2 whitespace-nowrap">
                      {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
