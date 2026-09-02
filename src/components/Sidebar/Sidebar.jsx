import { NavLink } from 'react-router-dom';
import { CalendarDays, BarChart3, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo/Logo';
import { logoutUser } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'Calendar', icon: CalendarDays, end: true },
  { to: '/statistics', label: 'Statistics', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function Sidebar() {
  const { profile } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-[var(--border)] h-full overflow-y-auto px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
          <Logo size={32} />
        </div>
        <span className="font-semibold text-[15px] text-[var(--ink)]">Work Tracker</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                isActive ? 'bg-[var(--selected-soft)] text-[var(--selected)]' : 'text-[var(--ink-soft)] hover:bg-[var(--border-soft)]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-[var(--border)]">
        <div className="px-3 mb-3">
          <p className="text-[13px] font-medium text-[var(--ink)] truncate">{profile?.name ?? 'Loading…'}</p>
          <p className="text-[12px] text-[var(--ink-faint)] truncate">{profile?.email}</p>
        </div>
        <button
          onClick={() => logoutUser()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[var(--ink-soft)] hover:bg-[var(--border-soft)] w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
