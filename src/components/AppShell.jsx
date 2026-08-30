import { Sidebar } from '@/components/Sidebar/Sidebar';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';

export function AppShell({ children }) {
  return (
    <div className="h-dvh flex flex-col md:flex-row overflow-hidden bg-[var(--paper)]">
      <Sidebar />
      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl w-full mx-auto">{children}</div>
      </main>
      <BottomNavigation />
    </div>
  );
}
