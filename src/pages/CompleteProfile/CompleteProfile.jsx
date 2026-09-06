import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { completeProfileSetup } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';

export function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await completeProfileSetup({ name: name.trim(), password, hourlyRate: rate, taxRate: tax });
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
          <h1 className="text-[20px] font-bold text-[var(--ink)]">Finish setting up</h1>
          <p className="text-[14px] text-[var(--ink-faint)] mt-1 text-center">
            <span className="font-medium">{user?.email}</span> is verified — just a few more details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Confirm Password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Input label="Hourly Rate" type="number" min={0} suffix="₩" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
            <Input label="Tax Rate" type="number" min={0} max={100} step={0.1} suffix="%" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </div>
          <p className="text-[12px] text-[var(--ink-faint)]">You can change these anytime in Settings.</p>

          {error && <p className="text-[13px] text-[var(--negative)]">{error}</p>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Finishing…' : 'Finish'}
          </Button>
        </form>
      </div>
    </div>
  );
}
