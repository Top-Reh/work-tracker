import { useEffect, useState } from 'react';
import { subscribeToMonthSettings } from '@/services/monthSettings';

export function useMonthSettings(uid, year, month) {
  const [monthSettings, setMonthSettingsState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsubscribe = subscribeToMonthSettings(
      uid,
      year,
      month,
      (data) => {
        setMonthSettingsState(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, [uid, year, month]);

  return { monthSettings, loading };
}
