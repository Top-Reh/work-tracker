import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isEmailLinkSignIn, completeEmailLinkSignIn } from '@/services/auth';

const STORAGE_KEY = 'emailForSignIn';

function cleanUrl() {
  // Strip Firebase's oobCode/apiKey query params so a refresh doesn't try to re-consume the link.
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, '', url.toString());
}

export function EmailLinkGate({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'resolving' | 'needsEmail' | 'done'
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEmailLinkSignIn()) {
      setStatus('done');
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setStatus('resolving');
      completeEmailLinkSignIn(stored)
        .then(() => {
          cleanUrl();
          setStatus('done');
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Could not verify that link.');
          setStatus('needsEmail');
        });
    } else {
      // Likely opened on a different device/browser than where registration started.
      setStatus('needsEmail');
    }
  }, []);

  async function handleConfirm(e) {
    e.preventDefault();
    setError('');
    setStatus('resolving');
    try {
      await completeEmailLinkSignIn(email.trim());
      cleanUrl();
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify that link.');
      setStatus('needsEmail');
    }
  }

  if (status === 'checking' || status === 'resolving') {
    return (
      <div className="h-dvh flex items-center justify-center bg-[var(--paper)]">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--ink)] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'needsEmail') {
    return (
      <div className="h-dvh flex items-center justify-center bg-[var(--paper)] px-4">
        <form onSubmit={handleConfirm} className="w-full max-w-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl overflow-hidden mx-auto">
            <Logo size={48} />
          </div>
          <h1 className="text-[18px] font-bold text-[var(--ink)]">Confirm your email</h1>
          <p className="text-[14px] text-[var(--ink-faint)]">
            This link was opened on a different device or browser than where you started. Enter the email you used to
            request it, so we can confirm it's really you.
          </p>
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          {error && <p className="text-[13px] text-[var(--negative)]">{error}</p>}
          <Button type="submit" fullWidth>
            Confirm
          </Button>
        </form>
      </div>
    );
  }

  return children;
}
