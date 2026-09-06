import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { auth } from '@/services/firebase';
import { resendVerificationEmail } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [verified, setVerified] = useState(user?.emailVerified ?? true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setVerified(user?.emailVerified ?? true);
  }, [user]);

  // If the user verified in another tab and came back, catch up without needing a full reload.
  useEffect(() => {
    if (!user || user.emailVerified) return;
    auth.currentUser
      ?.reload()
      .then(() => setVerified(auth.currentUser?.emailVerified ?? false))
      .catch(() => {});
  }, [user]);

  if (!user?.email || verified) return null;

  async function handleResend() {
    setSending(true);
    try {
      await resendVerificationEmail();
      showToast('Verification email sent.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not send the email.', 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-2.5 bg-[var(--selected-soft)] px-4 py-2.5 text-[13px]">
      <Mail size={16} className="text-[var(--selected)] shrink-0" />
      <p className="text-[var(--ink)] flex-1 min-w-0 truncate">
        Verify <span className="font-medium">{user.email}</span> to secure your account.
      </p>
      <button onClick={handleResend} disabled={sending} className="shrink-0 font-medium text-[var(--selected)] disabled:opacity-50">
        {sending ? 'Sending…' : 'Resend'}
      </button>
    </div>
  );
}
