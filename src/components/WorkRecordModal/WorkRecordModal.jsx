import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { calculateRecord, calculateDurationFromTimes, formatHoursMinutes } from '@/utils/salaryCalculations';
import { formatCurrency, formatSignedCurrency } from '@/utils/currencyUtils';
import { fromDateKey } from '@/utils/dateUtils';

export function WorkRecordModal({
  open,
  dateKey,
  existingRecord,
  defaultHourlyRate,
  defaultTaxRate,
  saving,
  onClose,
  onSave,
  onDelete,
}) {
  const [entryMode, setEntryMode] = useState('manual'); // 'manual' | 'range'
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [hourlyRate, setHourlyRate] = useState(String(defaultHourlyRate));
  const [taxRate, setTaxRate] = useState(String(defaultTaxRate));
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (existingRecord) {
      setHourlyRate(String(existingRecord.hourlyRate));
      setTaxRate(String(existingRecord.taxRate));
      setNote(existingRecord.note ?? '');
      if (existingRecord.startTime && existingRecord.endTime) {
        setEntryMode('range');
        setStartTime(existingRecord.startTime);
        setEndTime(existingRecord.endTime);
      } else {
        setEntryMode('manual');
        setHours(String(existingRecord.hours));
        setMinutes(String(existingRecord.minutes));
      }
    } else {
      setEntryMode('manual');
      setHours('0');
      setMinutes('0');
      setStartTime('09:00');
      setEndTime('18:00');
      setHourlyRate(String(defaultHourlyRate));
      setTaxRate(String(defaultTaxRate));
      setNote('');
    }
    setErrors({});
  }, [open, existingRecord, defaultHourlyRate, defaultTaxRate]);

  if (!open) return null;

  // In range mode, hours/minutes are derived automatically from the clock times.
  const rangeDuration = entryMode === 'range' ? calculateDurationFromTimes(startTime, endTime) : null;
  const numHours = entryMode === 'range' ? rangeDuration.hours : Number(hours) || 0;
  const numMinutes = entryMode === 'range' ? rangeDuration.minutes : Number(minutes) || 0;
  const numRate = Number(hourlyRate) || 0;
  const numTax = Number(taxRate) || 0;
  const calc = calculateRecord(numHours, numMinutes, numRate, numTax);

  const dateLabel = fromDateKey(dateKey).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  function validate() {
    const next = {};
    if (entryMode === 'manual') {
      if (Number.isNaN(numHours) || numHours < 0 || numHours > 24) next.hours = 'Enter a value between 0 and 24.';
      if (Number.isNaN(numMinutes) || numMinutes < 0 || numMinutes > 59) next.minutes = 'Enter a value between 0 and 59.';
      if (numHours === 0 && numMinutes === 0) next.hours = 'Enter hours or minutes worked.';
    } else {
      if (!startTime || !endTime) next.hours = 'Enter both a start and end time.';
      else if (numHours === 0 && numMinutes === 0) next.hours = 'Start and end time cannot be the same.';
    }
    if (Number.isNaN(numRate) || numRate < 0) next.hourlyRate = 'Hourly rate cannot be negative.';
    if (Number.isNaN(numTax) || numTax < 0 || numTax > 100) next.taxRate = 'Enter a value between 0 and 100.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      hours: numHours,
      minutes: numMinutes,
      hourlyRate: numRate,
      taxRate: numTax,
      note: note.trim(),
      startTime: entryMode === 'range' ? startTime : null,
      endTime: entryMode === 'range' ? endTime : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-[var(--paper-raised)] rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-6 max-h-[92dvh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[13px] text-[var(--ink-faint)] font-medium">{existingRecord ? 'Edit Work Record' : 'Add Work Record'}</p>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[var(--ink)]">{dateLabel}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--border-soft)]">
            <X size={18} className="text-[var(--ink-soft)]" />
          </button>
        </div>

        <div className="flex gap-2 mb-4 p-1 bg-[var(--paper)] border border-[var(--border)] rounded-xl">
          <button
            type="button"
            onClick={() => setEntryMode('manual')}
            className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              entryMode === 'manual' ? 'bg-[var(--paper-raised)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-faint)]'
            }`}
          >
            Enter hours
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('range')}
            className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              entryMode === 'range' ? 'bg-[var(--paper-raised)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-faint)]'
            }`}
          >
            Start &amp; end time
          </button>
        </div>

        {entryMode === 'manual' ? (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input label="Hours" type="number" inputMode="numeric" min={0} max={24} value={hours} onChange={(e) => setHours(e.target.value)} error={errors.hours} />
            <Input label="Minutes" type="number" inputMode="numeric" min={0} max={59} value={minutes} onChange={(e) => setMinutes(e.target.value)} error={errors.minutes} />
          </div>
        ) : (
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} error={errors.hours} />
              <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <p className="text-[13px] text-[var(--ink-soft)] mt-2 text-center">
              Auto-calculated: <span className="font-semibold text-[var(--ink)] tabular">{formatHoursMinutes(numHours + numMinutes / 60)}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Input label="Hourly Rate" type="number" inputMode="numeric" min={0} suffix="₩" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} error={errors.hourlyRate} />
          <Input label="Tax Rate" type="number" inputMode="decimal" min={0} max={100} step={0.1} suffix="%" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} error={errors.taxRate} />
        </div>

        <Input label="Note (optional)" type="text" placeholder="e.g. Morning shift" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className="mb-4" />

        <div className="bg-[var(--paper)] border border-[var(--border)] rounded-xl px-4 py-3 mb-5 space-y-2">
          <div className="flex justify-between text-[14px]">
            <span className="text-[var(--ink-soft)]">Gross Salary</span>
            <span className="tabular font-medium text-[var(--ink)]">{formatCurrency(calc.grossSalary)}</span>
          </div>
          <div className="flex justify-between text-[14px]">
            <span className="text-[var(--ink-soft)]">Tax ({numTax || 0}%)</span>
            <span className="tabular font-medium text-[var(--negative)]">{formatSignedCurrency(-calc.taxAmount)}</span>
          </div>
          <div className="ledger-rule h-px w-full my-1" />
          <div className="flex justify-between text-[15px]">
            <span className="font-semibold text-[var(--ink)]">Net Salary</span>
            <span className="tabular font-bold text-[var(--work-strong)]">{formatCurrency(calc.netSalary)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {existingRecord && onDelete && (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)} aria-label="Delete record" disabled={saving}>
              <Trash2 size={17} className="text-[var(--negative)]" />
            </Button>
          )}
          <Button variant="secondary" fullWidth onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : existingRecord ? 'Save Changes' : 'Save'}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this work record?"
        description="This will permanently remove the hours and salary logged for this day."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete?.();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
