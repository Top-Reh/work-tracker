import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signInWithGoogle } from '@/services/auth';

export function SocialSignIn({ onSuccess, onError, onChoosePhone }) {
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

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-[12px] text-[var(--ink-faint)]">or continue with</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="space-y-2">
        <Button variant="secondary" fullWidth onClick={handleGoogle} disabled={loading}>
          Continue with Google
        </Button>
        <Button variant="secondary" fullWidth onClick={onChoosePhone} disabled={loading}>
          <span className="flex items-center justify-center gap-2">
            <Phone size={16} />
            Continue with phone number
          </span>
        </Button>
      </div>
    </div>
  );
}
