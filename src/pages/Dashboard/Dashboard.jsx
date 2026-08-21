import { useMemo, useState } from 'react';
import { Header } from '@/components/Header/Header';
import { SalarySummary } from '@/components/SalarySummary/SalarySummary';
import { Calendar } from '@/components/Calendar/Calendar';
import { WorkRecordModal } from '@/components/WorkRecordModal/WorkRecordModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useMonthRecords } from '@/hooks/useWorkRecords';
import { saveWorkRecord, deleteWorkRecord } from '@/services/workRecords';
import { addMonths } from '@/utils/dateUtils';
import { useToast } from '@/context/ToastContext';

export function Dashboard() {
  const { user, profile, profileLoading } = useAuth();
  const { showToast } = useToast();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { records, summary, loading } = useMonthRecords(user?.uid, year, month);

  const recordsByDate = useMemo(() => {
    const map = new Map();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const existingRecord = selectedDate ? recordsByDate.get(selectedDate) : undefined;

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

  async function handleSave(data) {
    if (!user || !selectedDate) return;
    setSaving(true);
    try {
      await saveWorkRecord(user.uid, { date: selectedDate, ...data });
      showToast('Work record saved.', 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save record.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || !existingRecord) return;
    setSaving(true);
    try {
      await deleteWorkRecord(user.uid, existingRecord.id);
      showToast('Work record deleted.', 'success');
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete record.', 'error');
    } finally {
      setSaving(false);
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
          <SalarySummary monthLabel={`${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]} ${year}`} summary={summary} />

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
          existingRecord={existingRecord}
          defaultHourlyRate={profile?.hourlyRate ?? 10000}
          defaultTaxRate={profile?.taxRate ?? 3.3}
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={existingRecord ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
