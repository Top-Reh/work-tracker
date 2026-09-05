import { useMemo, useState } from 'react';
import { Header } from '@/components/Header/Header';
import { MonthRateBar } from '@/components/MonthRateBar/MonthRateBar';
import { SalarySummary } from '@/components/SalarySummary/SalarySummary';
import { Calendar } from '@/components/Calendar/Calendar';
import { WorkRecordModal } from '@/components/WorkRecordModal/WorkRecordModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useMonthRecords } from '@/hooks/useWorkRecords';
import { useMonthSettings } from '@/hooks/useMonthSettings';
import { buildEntry, saveDayEntries, deleteDayRecord, recalculateRecordsWithNewRates } from '@/services/workRecords';
import { setMonthSettings } from '@/services/monthSettings';
import { addMonths } from '@/utils/dateUtils';
import { generateId } from '@/utils/id';
import { useToast } from '@/context/ToastContext';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function Dashboard() {
  const { user, profile, profileLoading } = useAuth();
  const { showToast } = useToast();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applyingRate, setApplyingRate] = useState(false);

  const { records, summary, loading } = useMonthRecords(user?.uid, year, month);
  const { monthSettings } = useMonthSettings(user?.uid, year, month);

  const recordsByDate = useMemo(() => {
    const map = new Map();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const existingRecord = selectedDate ? recordsByDate.get(selectedDate) : undefined;

  // This month's effective rate: the month-specific override if one has been set,
  // otherwise the user's global default from Settings.
  const effectiveHourlyRate = monthSettings?.hourlyRate ?? profile?.hourlyRate ?? 10000;
  const effectiveTaxRate = monthSettings?.taxRate ?? profile?.taxRate ?? 3.3;

  function goToMonth(delta) {
    const next = addMonths(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  function goToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  function handleSelectDate(dateKey) {
    setSelectedDate(dateKey);
    setModalOpen(true);
  }

  /** Adds a new time entry, or updates one in place if entryId is given. Returns true on success. */
  async function handleSaveEntry(entryId, data) {
    if (!user || !selectedDate) return false;
    setSaving(true);
    try {
      const currentEntries = existingRecord?.entries ?? [];
      const entry = buildEntry(entryId ?? generateId(), data);
      const newEntries = entryId ? currentEntries.map((e) => (e.id === entryId ? entry : e)) : [...currentEntries, entry];

      await saveDayEntries(user.uid, selectedDate, newEntries);
      showToast(entryId ? 'Time updated.' : 'Time added.', 'success');
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save.', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  }

  /** Removes one time entry. If it was the day's last entry, the whole day record is removed. Returns { success, emptied }. */
  async function handleDeleteEntry(entryId) {
    if (!user || !selectedDate) return { success: false, emptied: false };
    setSaving(true);
    try {
      const currentEntries = existingRecord?.entries ?? [];
      const newEntries = currentEntries.filter((e) => e.id !== entryId);

      if (newEntries.length === 0) {
        await deleteDayRecord(user.uid, selectedDate);
      } else {
        await saveDayEntries(user.uid, selectedDate, newEntries);
      }
      showToast('Time deleted.', 'success');
      return { success: true, emptied: newEntries.length === 0 };
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete.', 'error');
      return { success: false, emptied: false };
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyMonthRate(newRate, newTax) {
    if (!user) return;
    setApplyingRate(true);
    try {
      await setMonthSettings(user.uid, year, month, newRate, newTax);
      if (records.length > 0) {
        await recalculateRecordsWithNewRates(user.uid, records, newRate, newTax);
      }
      showToast(`${MONTH_SHORT[month]} rate updated.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update the rate.', 'error');
    } finally {
      setApplyingRate(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div>
      <Header year={year} month={month} onPrevMonth={() => goToMonth(-1)} onNextMonth={() => goToMonth(1)} onToday={goToday} isCurrentMonth={isCurrentMonth} />

      {loading ? (
        <div className="px-4 pt-6 space-y-3">
          <Skeleton className="h-12 w-56 mx-auto" />
          <div className="flex gap-2">
            <Skeleton className="h-16 flex-1" />
            <Skeleton className="h-16 flex-1" />
            <Skeleton className="h-16 flex-1" />
            <Skeleton className="h-16 flex-1" />
          </div>
          <Skeleton className="h-80 w-full mt-4" />
        </div>
      ) : (
        <>
          <SalarySummary monthLabel={`${MONTH_SHORT[month]} ${year}`} summary={summary} />

          <MonthRateBar
            monthLabel={`${MONTH_SHORT[month]} ${year}`}
            hourlyRate={effectiveHourlyRate}
            taxRate={effectiveTaxRate}
            recordCount={records.length}
            saving={applyingRate}
            onApply={handleApplyMonthRate}
          />

          {records.length === 0 && (
            <div className="mx-4 mb-3 rounded-xl bg-[var(--work-soft)] px-4 py-3 text-center">
              <p className="text-[13px] text-[var(--work-strong)] font-medium">No work records yet.</p>
              <p className="text-[12px] text-[var(--ink-soft)] mt-0.5">Tap a date below to add your first work record.</p>
            </div>
          )}

          <Calendar
            year={year}
            month={month}
            recordsByDate={recordsByDate}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </>
      )}

      {selectedDate && (
        <WorkRecordModal
          open={modalOpen}
          dateKey={selectedDate}
          entries={existingRecord?.entries ?? []}
          defaultHourlyRate={effectiveHourlyRate}
          defaultTaxRate={effectiveTaxRate}
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSaveEntry={handleSaveEntry}
          onDeleteEntry={handleDeleteEntry}
        />
      )}
    </div>
  );
}
