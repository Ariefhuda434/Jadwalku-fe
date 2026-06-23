import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarRange, CheckSquare, Calendar, HelpCircle, Users } from 'lucide-react';
import logoSrc from '../../assets/logo.svg';

const menus = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jadwal', label: 'Jadwal', icon: CalendarRange },
  { to: '/tugas', label: 'Tugas', icon: CheckSquare },
  { to: '/grup', label: 'Grup', icon: Users },
  { to: '/kalender', label: 'Kalender', icon: Calendar },
  { to: '/faq', label: 'FAQ', icon: HelpCircle },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-bg-sidebar flex flex-col z-50">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-indigo-800/50">
        <img src={logoSrc} className="w-8 h-8" />
        <span className="font-heading font-semibold text-white text-lg">
          JadwalKu
        </span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menus.map((m) => {
          const Icon = m.icon;
          return (
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
              <Icon size={18} />
              <span>{m.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
