import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmailField } from '@/components/EmailField/EmailField';
import { PasswordSetup } from '@/components/PasswordSetup/PasswordSetup';
import { ChangePassword } from '@/components/ChangePassword/ChangePassword';
import { useAuth } from '@/hooks/useAuth';
import { updateProfileSettings } from '@/services/userProfile';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency, CURRENCIES } from '@/context/CurrencyContext';

export function Settings() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency, currencySymbol } = useCurrency();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? '');
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
      await updateProfileSettings(user.uid, { name: name.trim(), phone: phone.trim(), hourlyRate: rate, taxRate: tax, currency });
      showToast('Settings saved.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save settings.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 pt-6 pb-6 space-y-5">
      <h1 className="text-[18px] sm:text-[20px] font-bold text-[var(--ink)]">{t("Settings")}</h1>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-3">{t('Currency')}</h2>
        <select aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--paper-raised)] px-3 text-[15px] text-[var(--ink)]">
          {Object.entries(CURRENCIES).map(([code, item]) => (
            <option key={code} value={code}>{item.country} ({code})</option>
          ))}
        </select>
        <p className="text-[12px] text-[var(--ink-faint)] mt-2">{t('Currency changes formatting only; amounts are not converted.')}</p>
      </Card>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-3">{t("Language")}</h2>
        <select aria-label={t("Language")} value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--paper-raised)] px-3 text-[15px] text-[var(--ink)]">
          <option value="en">{t("English")}</option>
          <option value="my">{t("Burmese (Myanmar)")}</option>
        </select>
      </Card>

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-4">{t("Profile")}</h2>
        <div className="space-y-3">
          <Input label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} />
          <EmailField />
          <Input label={t("Phone")} type="tel" placeholder={t("Optional")} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </Card>

      <PasswordSetup />
      <ChangePassword />

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-[var(--ink)] mb-1">{t("Salary Settings")}</h2>
        <p className="text-[12px] text-[var(--ink-faint)] mb-4">
          {t("These are your default rates for new months. Use the rate bar at the top of the calendar to change a single month.")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input label={t("Hourly Rate")} type="number" min={0} suffix={currencySymbol} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
          <Input label={t("Tax Rate")} type="number" min={0} max={100} step={0.1} suffix="%" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        </div>
      </Card>

      <Button fullWidth onClick={handleSaveProfile} disabled={saving}>
        {saving ? t('Savingâ€¦') : t('Save Settings')}
      </Button>
    </div>
  );
}



