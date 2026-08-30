import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';

const FULL_SCREEN_SPINNER = (
  <div className="h-dvh flex items-center justify-center bg-[var(--paper)]">
    <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--ink)] rounded-full animate-spin" />
  </div>
);

export function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) return FULL_SCREEN_SPINNER;
  if (!user) return <Navigate to="/login" replace />;

  return <AppShell>{children}</AppShell>;
}
