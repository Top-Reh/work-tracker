import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AccountLinkRequiredError, signInWithGoogle, linkGoogleToPasswordAccount, resetPassword } from '@/services/auth';
import { useToast } from '@/context/ToastContext';

export function SocialSignIn({ onSuccess, onError, onChoosePhone }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  // Set when Google found an existing account for the same email under a different method.
  const [linkPrompt, setLinkPrompt] = useState(null); // { email, pendingCredential }
  const [password, setPassword] = useState('');

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err) {
      if (err instanceof AccountLinkRequiredError) {
        setLinkPrompt({ email: err.email, pendingCredential: err.pendingCredential });
      } else {
        onError(err instanceof Error ? err.message : 'Could not sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLink() {
    if (!password) return onError('Enter your password to continue.');
    setLoading(true);
    try {
      await linkGoogleToPasswordAccount(linkPrompt.email, password, linkPrompt.pendingCredential);
      showToast('Google is now connected to your account.', 'success');
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not connect Google to your account.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    try {
      await resetPassword(linkPrompt.email);
      showToast('Password reset email sent.', 'success');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not send the reset email.');
    }
  }

  if (linkPrompt) {
    return (
      <div className="mt-5 space-y-3">
        <p className="text-[14px] text-[var(--ink)]">
          An account with <span className="font-medium">{linkPrompt.email}</span> already exists. Enter its password to
          connect Google to it — your password stays exactly the same, and both ways of signing in will work.
        </p>
        <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        <Button fullWidth onClick={handleLink} disabled={loading}>
          {loading ? 'Connecting…' : 'Connect Google'}
        </Button>
        <div className="flex items-center justify-between">
          <button type="button" onClick={handleForgot} className="text-[13px] text-[var(--selected)] font-medium">
            Forgot password?
          </button>
          <button
            type="button"
            onClick={() => {
              setLinkPrompt(null);
              setPassword('');
            }}
            className="text-[13px] text-[var(--ink-soft)] font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-[12px] text-[var(--ink-faint)]">or continue with</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="space-y-2">
        <Button variant="secondary" fullWidth onClick={handleGoogle} disabled={loading}>
          Continue with Google
        </Button>
        <Button variant="secondary" fullWidth onClick={onChoosePhone} disabled={loading}>
          <span className="flex items-center justify-center gap-2">
            <Phone size={16} />
            Continue with phone number
          </span>
        </Button>
      </div>
    </div>
  );
}
