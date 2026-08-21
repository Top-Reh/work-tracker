import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { updateProfileSettings } from '@/services/userProfile';
import { changePassword, deleteAccount, logoutUser } from '@/services/auth';
import { useToast } from '@/context/ToastContext';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function Settings() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [theme, setTheme] = useState('system');
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? '');
    setPhone(profile.phone ?? '');
    setHourlyRate(String(profile.hourlyRate ?? 0));
    setTaxRate(String(profile.taxRate ?? 0));
    setTheme(profile.theme ?? 'system');
  }, [profile]);

  async function handleSaveProfile() {
    if (!user) return;
    const rate = Number(hourlyRate);
    const tax = Number(taxRate);
    if (!name.trim()) return showToast('Name cannot be empty.', 'error');
    if (Number.isNaN(rate) || rate < 0) return showToast('Hourly rate must be 0 or greater.', 'error');
    if (Number.isNaN(tax) || tax < 0 || tax > 100) return showToast('Tax rate must be between 0 and 100.', 'error');

    setSaving(true);
    try {
      await updateProfileSettings(user.uid, { name: name.trim(), phone: phone.trim(), hourlyRate: rate, taxRate: tax, theme });
      showToast('Settings saved.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save settings.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) return showToast('Password should be at least 6 characters.', 'error');
    setChangingPassword(true);
    try {
      await changePassword(newPassword);
      setNewPassword('');
      showToast('Password updated.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete account.', 'error');
    }
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-5">
      <h1 className="text-[20px] font-bold text-[var(--ink)]">Settings</h1>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-4">Profile</h2>
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={profile?.email ?? ''} disabled />
          <Input label="Phone" type="tel" placeholder="Optional" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-1">Salary Settings</h2>
        <p className="text-[12px] text-[var(--ink-faint)] mb-4">Applies to new work records only — past records keep their original rate.</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Hourly Rate" type="number" min={0} suffix="₩" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
          <Input label="Tax Rate" type="number" min={0} max={100} step={0.1} suffix="%" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-4">Appearance</h2>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                theme === t.value ? 'bg-[var(--selected-soft)] border-[var(--selected)] text-[var(--selected)]' : 'border-[var(--border)] text-[var(--ink-soft)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Button fullWidth onClick={handleSaveProfile} disabled={saving}>
        {saving ? 'Saving…' : 'Save Settings'}
      </Button>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-4">Account</h2>
        <div className="flex gap-2 mb-3">
          <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button variant="secondary" onClick={handleChangePassword} disabled={changingPassword || !newPassword}>
            Change
          </Button>
        </div>
        <Button variant="secondary" fullWidth onClick={() => logoutUser()} className="mb-2">
          Logout
        </Button>
        <Button variant="danger" fullWidth onClick={() => setConfirmDelete(true)}>
          Delete Account
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        description="This permanently deletes your login. Your work records will remain in the database unless removed separately. This cannot be undone."
        confirmLabel="Delete Account"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          handleDeleteAccount();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
