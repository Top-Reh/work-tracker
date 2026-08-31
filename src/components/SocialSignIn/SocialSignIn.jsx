import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signInWithGoogle, sendPhoneVerificationCode, confirmPhoneCode } from '@/services/auth';

export function SocialSignIn({ onSuccess, onError }) {
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not sign in with Google.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    if (!phoneNumber.trim()) return onError('Enter your phone number, including country code (e.g. +82…).');
    setLoading(true);
    try {
      const result = await sendPhoneVerificationCode(phoneNumber.trim());
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
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-[12px] text-[var(--ink-faint)]">or continue with</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {!phoneMode ? (
        <div className="space-y-2">
          <Button variant="secondary" fullWidth onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setPhoneMode(true)} disabled={loading}>
            <span className="flex items-center justify-center gap-2">
              <Phone size={16} />
              Continue with phone number
            </span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {!confirmation ? (
            <>
              <Input label="Phone Number" type="tel" placeholder="+82 10 1234 5678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
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
          <button type="button" onClick={() => { setPhoneMode(false); setConfirmation(null); setCode(''); }} className="text-[13px] text-[var(--selected)] font-medium w-full text-center">
            Back to other options
          </button>
        </div>
      )}

      {/* Required, invisible container for the reCAPTCHA verifier phone auth needs. */}
      <div id="recaptcha-container" />
    </div>
  );
}
