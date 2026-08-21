import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, BarChart3, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/', label: 'Calendar', icon: CalendarDays, end: true },
  { to: '/statistics', label: 'Statistics', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function BottomNavigation() {
  // "Home" and "Calendar" both point at the dashboard (calendar is the home surface),
  // so only render the distinct destinations to avoid duplicate active tabs.
  const items = [NAV_ITEMS[0], NAV_ITEMS[2], NAV_ITEMS[3]];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--paper-raised)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] rounded-lg transition-colors ${
                isActive ? 'text-[var(--selected)]' : 'text-[var(--ink-faint)]'
              }`
            }
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
