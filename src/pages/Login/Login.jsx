import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SocialSignIn } from '@/components/SocialSignIn/SocialSignIn';
import { PhoneSignIn } from '@/components/PhoneSignIn/PhoneSignIn';
import { loginUser, resetPassword } from '@/services/auth';
import { useToast } from '@/context/ToastContext';

export function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email above first, then tap "Forgot password?"');
      return;
    }
    try {
      await resetPassword(email);
      showToast('Password reset email sent.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not send reset email.', 'error');
    }
  }

  return (
    <div className="h-dvh overflow-y-auto flex items-center justify-center bg-[var(--paper)] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden mb-3">
            <Logo size={48} />
          </div>
          <h1 className="text-[20px] font-bold text-[var(--ink)]">Work Tracker</h1>
          <p className="text-[14px] text-[var(--ink-faint)] mt-1">Sign in to your account</p>
        </div>

        {method === 'email' ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />

              {error && <p className="text-[13px] text-[var(--negative)]">{error}</p>}

              <div className="flex justify-end">
                <button type="button" onClick={handleForgotPassword} className="text-[13px] text-[var(--selected)] font-medium">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            <SocialSignIn
              onSuccess={() => navigate('/')}
              onError={(msg) => showToast(msg, 'error')}
              onChoosePhone={() => setMethod('phone')}
            />
          </>
        ) : (
          <PhoneSignIn
            onSuccess={() => navigate('/')}
            onError={(msg) => showToast(msg, 'error')}
            onBack={() => setMethod('email')}
          />
        )}

        {method === 'email' && (
          <p className="text-center text-[14px] text-[var(--ink-soft)] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--selected)] font-medium">
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
