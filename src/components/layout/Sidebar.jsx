import { NavLink } from 'react-router-dom';

const menus = [
  { to: '/', label: 'Dashboard', icon: '⬡' },
  { to: '/jadwal', label: 'Jadwal', icon: '☰' },
  { to: '/tugas', label: 'Tugas', icon: '☑' },
  { to: '/kalender', label: 'Kalender', icon: '◰' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-bg-sidebar flex flex-col z-50">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-indigo-800/50">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
          J
        </div>
        <span className="font-heading font-semibold text-white text-lg">
          JadwalKu
        </span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menus.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              }`
            }
          >
            <span className="text-lg w-6 text-center">{m.icon}</span>
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <div className="px-4 py-3 rounded-lg bg-indigo-800/30">
          <p className="text-xs text-indigo-300 font-medium">Butuh bantuan?</p>
          <p className="text-xs text-indigo-400 mt-0.5">Hubungi admin</p>
        </div>
      </div>
    </aside>
  );
}
