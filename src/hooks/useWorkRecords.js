import { useEffect, useState } from 'react';
import { subscribeToMonthRecords, subscribeToYearRecords } from '@/services/workRecords';
import { calculateMonthlySummary } from '@/utils/salaryCalculations';

export function useMonthRecords(uid, year, month) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToMonthRecords(
      uid,
      year,
      month,
      (data) => {
        setRecords(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [uid, year, month]);

  const summary = calculateMonthlySummary(records);

  return { records, summary, loading, error };
}

export function useYearRecords(uid, year) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToYearRecords(
      uid,
      year,
      (data) => {
        setRecords(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [uid, year]);

  return { records, loading, error };
}
