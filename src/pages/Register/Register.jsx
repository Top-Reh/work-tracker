import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SocialSignIn } from '@/components/SocialSignIn/SocialSignIn';
import { PhoneSignIn } from '@/components/PhoneSignIn/PhoneSignIn';
import { sendRegistrationLink } from '@/services/auth';
import { useToast } from '@/context/ToastContext';

export function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Enter your email address.');

    setLoading(true);
    try {
      await sendRegistrationLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    try {
      await sendRegistrationLink(email.trim());
      showToast('Verification link sent again.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not resend the link.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-dvh overflow-y-auto flex items-center justify-center bg-[var(--paper)] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl overflow-hidden mb-3">
            <Logo size={48} />
          </div>
          <h1 className="text-[20px] font-bold text-[var(--ink)]">Create your account</h1>
          <p className="text-[14px] text-[var(--ink-faint)] mt-1 text-center">Track your hours and salary in seconds</p>
        </div>

        {method === 'email' ? (
          sent ? (
            <div className="text-center space-y-4">
              <p className="text-[14px] text-[var(--ink)]">
                We sent a verification link to <span className="font-medium">{email}</span>. Open it to finish creating
                your account — nothing is created until you do.
              </p>
              <p className="text-[12px] text-[var(--ink-faint)]">Didn't get it? Check spam, or resend below.</p>
              <Button variant="secondary" fullWidth onClick={handleResend} disabled={loading}>
                {loading ? 'Sending…' : 'Resend link'}
              </Button>
              <button type="button" onClick={() => setSent(false)} className="text-[13px] text-[var(--selected)] font-medium">
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                {error && <p className="text-[13px] text-[var(--negative)]">{error}</p>}
                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? 'Sending…' : 'Send verification link'}
                </Button>
              </form>

              <SocialSignIn
                onSuccess={() => navigate('/')}
                onError={(msg) => showToast(msg, 'error')}
                onChoosePhone={() => setMethod('phone')}
              />
            </>
          )
        ) : (
          <PhoneSignIn
            onSuccess={() => navigate('/')}
            onError={(msg) => showToast(msg, 'error')}
            onBack={() => setMethod('email')}
          />
        )}

        {method === 'email' && !sent && (
          <p className="text-center text-[14px] text-[var(--ink-soft)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--selected)] font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
