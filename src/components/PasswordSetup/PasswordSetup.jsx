import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { addPasswordToAccount } from '@/services/auth';
import { useToast } from '@/context/ToastContext';

/**
 * Only appears for accounts that have an email but no password sign-in (for example, after
 * signing in with Google). Lets the user add a password to the SAME account — nothing new
 * is created, and Google sign-in keeps working.
 */
export function PasswordSetup() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);

  const hasPassword = added || (user?.providerData ?? []).some((p) => p.providerId === 'password');
  if (!user?.email || hasPassword) return null;

  async function handleSubmit() {
    if (password.length < 6) return showToast('Password should be at least 6 characters.', 'error');
    if (password !== confirm) return showToast('Passwords do not match.', 'error');
    setSaving(true);
    try {
      await addPasswordToAccount(password);
      setAdded(true);
      showToast('Password set. You can now sign in with your email and password too.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not set the password.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-1">Password sign-in</h2>
      <p className="text-[12px] text-[var(--ink-faint)] mb-4">
        You currently sign in with Google. Set a password to also sign in with <span className="font-medium">{user.email}</span> and a password.
      </p>
      <div className="space-y-3">
        <Input label="New Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirm Password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button fullWidth onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Set password'}
        </Button>
      </div>
    </Card>
  );
}
