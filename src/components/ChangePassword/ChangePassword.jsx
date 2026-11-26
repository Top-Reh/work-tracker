import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { changePasswordWithCurrent } from '@/services/auth';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
//gg//

/**
 * Only for accounts that sign in with a password (otherwise PasswordSetup is shown instead).
 * Collapsed by default â€” the form only appears once the user taps "Change password".
 */
export function ChangePassword() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const hasPassword = (user?.providerData ?? []).some((p) => p.providerId === 'password');
  if (!user?.email || !hasPassword) return null;

  function close() {
    setOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirm('');
  }

  async function handleSubmit() {
    if (!currentPassword) return showToast('Enter your current password.', 'error');
    if (newPassword.length < 6) return showToast('New password should be at least 6 characters.', 'error');
    if (newPassword === currentPassword) return showToast('Your new password must be different from the current one.', 'error');
    if (newPassword !== confirm) return showToast('The new passwords do not match.', 'error');

    setSaving(true);
    try {
      await changePasswordWithCurrent(currentPassword, newPassword);
      close();
      showToast('Password updated.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update the password.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-[var(--ink)]">{t("Password")}</h2>
            <p className="text-[12px] text-[var(--ink-faint)] mt-0.5">{t("Update your sign-in password.")}</p>
          </div>
          <Button variant="secondary" className="shrink-0 whitespace-nowrap" onClick={() => setOpen(true)}>
            {t("Change password")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-4">{t("Change password")}</h2>
      <div className="space-y-3">
        <Input label={t("Current Password")} type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoFocus />
        <Input label={t("New Password")} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Input label={t("Confirm New Password")} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={close} disabled={saving}>
            {t("Cancel")}
          </Button>
          <Button fullWidth onClick={handleSubmit} disabled={saving}>
            {saving ? 'Updatingâ€¦' : t('Update password')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

