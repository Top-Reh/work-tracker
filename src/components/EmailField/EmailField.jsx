import { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { changeEmail, resendVerificationEmail } from '@/services/auth';
import { useToast } from '@/context/ToastContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailField() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [draftEmail, setDraftEmail] = useState('');
  const [sending, setSending] = useState(false);

  const hasEmail = Boolean(user?.email);
  const verified = Boolean(user?.emailVerified);

  async function handleSubmit() {
    if (!EMAIL_PATTERN.test(draftEmail.trim())) {
      return showToast('Enter a valid email address.', 'error');
    }
    setSending(true);
    try {
      await changeEmail(draftEmail.trim());
      showToast(`Verification link sent to ${draftEmail.trim()} — click it to confirm.`, 'success');
      setShowForm(false);
      setDraftEmail('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not send the verification link.', 'error');
    } finally {
      setSending(false);
    }
  }

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
    <div>
      <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">Email</label>

      {hasEmail && !showForm && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--paper-raised)] px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-[15px] text-[var(--ink)] truncate">{user.email}</p>
            <p className={`text-[12px] flex items-center gap-1 mt-0.5 ${verified ? 'text-[var(--work-strong)]' : 'text-[var(--ink-faint)]'}`}>
              {verified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
              {verified ? 'Verified' : 'Pending verification'}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            {!verified && (
              <button onClick={handleResend} disabled={sending} className="text-[12px] font-medium text-[var(--selected)] disabled:opacity-50">
                Resend
              </button>
            )}
            <button onClick={() => setShowForm(true)} className="text-[12px] font-medium text-[var(--selected)]">
              Change
            </button>
          </div>
        </div>
      )}

      {!hasEmail && !showForm && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--paper-raised)] px-3.5 py-2.5">
          <p className="text-[13px] text-[var(--ink-faint)]">No email on file — you signed in with your phone number.</p>
          <button onClick={() => setShowForm(true)} className="shrink-0 text-[12px] font-medium text-[var(--selected)]">
            Add email
          </button>
        </div>
      )}

      {showForm && (
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            autoFocus
          />
          <p className="text-[12px] text-[var(--ink-faint)]">
            We'll send a confirmation link — it only takes effect once you click it{hasEmail ? '; your current email stays active until then' : ''}.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => { setShowForm(false); setDraftEmail(''); }} disabled={sending}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleSubmit} disabled={sending}>
              {sending ? 'Sending…' : 'Send link'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
