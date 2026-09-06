import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';

const FULL_SCREEN_SPINNER = (
  <div className="h-dvh flex items-center justify-center bg-[var(--paper)]">
    <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--ink)] rounded-full animate-spin" />
  </div>
);

export function ProtectedRoute({ children }) {
  const { user, profile, authLoading, profileLoading } = useAuth();

  if (authLoading) return FULL_SCREEN_SPINNER;
  if (!user) return <Navigate to="/login" replace />;
  if (profileLoading) return FULL_SCREEN_SPINNER;
  if (!profile) return <Navigate to="/complete-profile" replace />;

  return <AppShell>{children}</AppShell>;
}

/** Guards /complete-profile itself: needs a signed-in user, but deliberately not a profile yet. */
export function OnboardingRoute({ children }) {
  const { user, profile, authLoading, profileLoading } = useAuth();

  if (authLoading || profileLoading) return FULL_SCREEN_SPINNER;
  if (!user) return <Navigate to="/login" replace />;
  if (profile) return <Navigate to="/" replace />;

  return children;
}
