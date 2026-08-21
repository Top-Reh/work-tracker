import { Sidebar } from '@/components/Sidebar/Sidebar';
import { BottomNavigation } from '@/components/BottomNavigation/BottomNavigation';

export function AppShell({ children }) {
  return (
    <div className="flex min-h-svh bg-[var(--paper)]">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 pb-20 md:pb-6 max-w-2xl w-full mx-auto">{children}</main>
      </div>
      <BottomNavigation />
    </div>
  );
}
