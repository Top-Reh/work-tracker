import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { updateProfileSettings } from '@/services/userProfile';
import { useToast } from '@/context/ToastContext';

export function Settings() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [saving, setSaving] = useState(false);

  // Only lock the field for accounts that actually signed in with an email/password
  // or Google credential — phone-only accounts have no login email, so they can
  // freely add one here as an optional contact detail.
  const emailLocked = Boolean(user?.email);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? '');
    setEmail(profile.email ?? '');
    setPhone(profile.phone ?? '');
    setHourlyRate(String(profile.hourlyRate ?? 0));
    setTaxRate(String(profile.taxRate ?? 0));
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
      await updateProfileSettings(user.uid, {
        name: name.trim(),
        email: emailLocked ? profile?.email ?? '' : email.trim(),
        phone: phone.trim(),
        hourlyRate: rate,
        taxRate: tax,
      });
      showToast('Settings saved.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save settings.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-5">
      <h1 className="text-[18px] sm:text-[20px] font-bold text-[var(--ink)]">Settings</h1>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-4">Profile</h2>
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            type="email"
            placeholder={emailLocked ? undefined : 'Optional'}
            value={emailLocked ? profile?.email ?? '' : email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={emailLocked}
          />
          {!emailLocked && (
            <p className="text-[12px] text-[var(--ink-faint)] -mt-2">You signed in with your phone number — add an email here if you'd like one on file.</p>
          )}
          <Input label="Phone" type="tel" placeholder="Optional" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-1">Salary Settings</h2>
        <p className="text-[12px] text-[var(--ink-faint)] mb-4">
          These are your default rates for new months. Use the rate bar at the top of the calendar to change a single month.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Hourly Rate" type="number" min={0} suffix="₩" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
          <Input label="Tax Rate" type="number" min={0} max={100} step={0.1} suffix="%" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        </div>
      </Card>

      <Button fullWidth onClick={handleSaveProfile} disabled={saving}>
        {saving ? 'Saving…' : 'Save Settings'}
      </Button>
    </div>
  );
}
