import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Settings, LogOut, ArrowLeftRight } from 'lucide-react';
import { logoutUser } from '@/services/auth';
import { useLanguage } from '@/context/LanguageContext';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/statistics', label: 'Stats', icon: BarChart3, end: false },
  { to: '/rates', label: 'Rates', icon: ArrowLeftRight, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function BottomNavigation() {
  const { t } = useLanguage();
  return (
    <nav className="md:hidden shrink-0 bg-[var(--paper-raised)] border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
                isActive ? 'text-[var(--selected)]' : 'text-[var(--ink-faint)]'
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span className="text-[10px] font-medium">{t(label)}</span>
          </NavLink>
        ))}
        <button
          onClick={() => logoutUser()}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-lg text-[var(--ink-faint)]"
        >
          <LogOut size={20} strokeWidth={2} />
          <span className="text-[10px] font-medium">{t("Logout")}</span>
        </button>
      </div>
    </nav>
  );
}

