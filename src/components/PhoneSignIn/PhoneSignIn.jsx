import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sendPhoneVerificationCode, confirmPhoneCode } from '@/services/auth';
import { toE164 } from '@/utils/phoneUtils';
import { COUNTRY_CODES } from '@/utils/countryCodes';

export function PhoneSignIn({ onSuccess, onError, onBack }) {
  const [dialCode, setDialCode] = useState(COUNTRY_CODES[0].dial);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSendCode() {
    const digitCount = phoneNumber.replace(/\D/g, '').length;
    if (digitCount < 7) return onError('Enter a valid phone number.');

    setLoading(true);
    try {
      const result = await sendPhoneVerificationCode(toE164(dialCode, phoneNumber));
      setConfirmation(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not send the verification code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCode() {
    if (!confirmation) return;
    if (!code.trim()) return onError('Enter the verification code you received.');
    setLoading(true);
    try {
      await confirmPhoneCode(confirmation, code.trim());
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not verify that code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {!confirmation ? (
        <>
          <div>
            <label className="block text-[13px] font-medium text-[var(--ink-soft)] mb-1.5">Phone Number</label>
            <div className="flex gap-2">
              <select
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
                className="min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--paper-raised)] px-2.5 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--selected)] focus:ring-2 focus:ring-[var(--selected-soft)]"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.dial}>
                    {c.code} {c.dial}
                  </option>
                ))}
              </select>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="10 1234 5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-[12px] text-[var(--ink-faint)] mt-1.5">Pick your country, then just your number — no need to type the country code.</p>
          </div>
          <Button fullWidth onClick={handleSendCode} disabled={loading}>
            {loading ? 'Sending…' : 'Send verification code'}
          </Button>
        </>
      ) : (
        <>
          <Input label="Verification Code" type="text" inputMode="numeric" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button fullWidth onClick={handleConfirmCode} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & sign in'}
          </Button>
        </>
      )}

      <button type="button" onClick={onBack} className="text-[13px] text-[var(--selected)] font-medium w-full text-center">
        Back to email sign-in
      </button>

      {/* Required, invisible container for the reCAPTCHA verifier phone auth needs. */}
      <div id="recaptcha-container" />
    </div>
  );
}
