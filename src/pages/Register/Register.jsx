import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SocialSignIn } from '@/components/SocialSignIn/SocialSignIn';
import { PhoneSignIn } from '@/components/PhoneSignIn/PhoneSignIn';
import { registerUser } from '@/services/auth';
import { useToast } from '@/context/ToastContext';

export function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('10000');
  const [taxRate, setTaxRate] = useState('3.3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your name.');
    if (password.length < 6) return setError('Password should be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    const rate = Number(hourlyRate);
    const tax = Number(taxRate);
    if (Number.isNaN(rate) || rate < 0) return setError('Hourly rate must be 0 or greater.');
    if (Number.isNaN(tax) || tax < 0 || tax > 100) return setError('Tax rate must be between 0 and 100.');

    setLoading(true);
    try {
      await registerUser(name.trim(), email, password, rate, tax);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
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
          <>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Input label="Confirm Password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Input label="Hourly Rate" type="number" min={0} suffix="₩" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                <Input label="Tax Rate" type="number" min={0} max={100} step={0.1} suffix="%" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
              </div>
              <p className="text-[12px] text-[var(--ink-faint)]">You can change these anytime in Settings.</p>

              {error && <p className="text-[13px] text-[var(--negative)]">{error}</p>}

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Creating account…' : 'Register'}
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
