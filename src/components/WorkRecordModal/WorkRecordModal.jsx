import { useEffect, useState } from 'react';
import { X, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { calculateRecord, calculateDurationFromTimes, formatHoursMinutes } from '@/utils/salaryCalculations';
import { fromDateKey, formatTimeLabel } from '@/utils/dateUtils';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';

export function WorkRecordModal({
  open,
  dateKey,
  entries,
  defaultHourlyRate,
  defaultTaxRate,
  saving,
  onClose,
  onSaveEntry,
  onDeleteEntry,
}) {
  const { t } = useLanguage();
  const { formatCurrency, formatSignedCurrency, currencySymbol } = useCurrency();
  const lastRangeKey = 'work-tracker-last-time-range';
  const [mode, setMode] = useState('list'); // 'list' | 'form'
  const [activeEntryId, setActiveEntryId] = useState(null);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hourlyRate, setHourlyRate] = useState(String(defaultHourlyRate));
  const [taxRate, setTaxRate] = useState(String(defaultTaxRate));
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Decide the starting view only when the modal opens for a (possibly new) date ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â
  // deliberately NOT reactive to `entries` itself, so a successful save doesn't
  // yank the view around once Firestore's real-time update comes back.
  useEffect(() => {
    if (!open) return;
    setMode(entries.length > 0 ? 'list' : 'form');
    setActiveEntryId(null);
    resetFormToDefaults();
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dateKey]);

  function resetFormToDefaults() {
    let lastRange = { startTime: '', endTime: '' };
    try {
      const savedRange = JSON.parse(localStorage.getItem(lastRangeKey) || 'null');
      if (savedRange?.startTime && savedRange?.endTime) lastRange = savedRange;
    } catch {
      // Ignore an invalid saved time preference.
    }
    const latestDayEntry = [...entries].reverse().find((entry) => entry.startTime && entry.endTime);
    if (!lastRange.startTime && latestDayEntry) {
      lastRange = { startTime: latestDayEntry.startTime, endTime: latestDayEntry.endTime };
    }
    setStartTime(lastRange.startTime || '');
    setEndTime(lastRange.endTime || '');
    setHourlyRate(String(defaultHourlyRate));
    setTaxRate(String(defaultTaxRate));
    setNote('');
  }

  function openAddForm() {
    setActiveEntryId(null);
    resetFormToDefaults();
    setErrors({});
    setMode('form');
  }

  function openEditForm(entry) {
    setActiveEntryId(entry.id);
    setHourlyRate(String(entry.hourlyRate));
    setTaxRate(String(entry.taxRate));
    setNote(entry.note ?? '');
    setStartTime(entry.startTime || '');
    setEndTime(entry.endTime || '');
    setErrors({});
    setMode('form');
  }

  if (!open) return null;

  const rangeDuration = calculateDurationFromTimes(startTime, endTime);
  const numHours = rangeDuration.hours;
  const numMinutes = rangeDuration.minutes;
  const numRate = Number(hourlyRate) || 0;
  const numTax = Number(taxRate) || 0;
  const calc = calculateRecord(numHours, numMinutes, numRate, numTax);

  const dateLabel = fromDateKey(dateKey).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayTotalHours = entries.reduce((sum, e) => sum + e.totalHours, 0);
  const dayTotalNet = entries.reduce((sum, e) => sum + e.netSalary, 0);

  function validate() {
    const next = {};
    if (!startTime || !endTime) next.hours = 'Enter both a start and end time.';
    else if (numHours === 0 && numMinutes === 0) next.hours = 'Start and end time cannot be the same.';
    if (Number.isNaN(numRate) || numRate < 0) next.hourlyRate = 'Hourly rate cannot be negative.';
    if (Number.isNaN(numTax) || numTax < 0 || numTax > 100) next.taxRate = 'Enter a value between 0 and 100.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    const ok = await onSaveEntry(activeEntryId, {
      hours: numHours,
      minutes: numMinutes,
      hourlyRate: numRate,
      taxRate: numTax,
      note: note.trim(),
      startTime,
      endTime,
    });
    if (ok) {
      try {
        localStorage.setItem(lastRangeKey, JSON.stringify({ startTime, endTime }));
      } catch {
        // The work record is still saved if local preferences are unavailable.
      }
      setMode('list');
    }
  }

  async function handleConfirmDelete() {
    setConfirmDelete(false);
    const result = await onDeleteEntry(activeEntryId);
    if (result.success) {
      if (result.emptied) onClose();
      else setMode('list');
    }
  }

  function handleCancelForm() {
    if (entries.length > 0) setMode('list');
    else onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-[var(--paper-raised)] rounded-t-3xl sm:rounded-3xl px-4 sm:px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[92dvh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {mode === 'list' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] text-[var(--ink-faint)] font-medium">
                  {entries.length} time{entries.length === 1 ? '' : 's'} logged
                </p>
                <h2 className="text-[17px] sm:text-[18px] font-semibold text-[var(--ink)]">{dateLabel}</h2>
              </div>
              <button onClick={onClose} aria-label={t("Close")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--border-soft)]">
                <X size={18} className="text-[var(--ink-soft)]" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => openEditForm(entry)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--border-soft)] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-[var(--ink)] tabular truncate">
                      {entry.startTime && entry.endTime ? `${formatTimeLabel(entry.startTime)} - ${formatTimeLabel(entry.endTime)}` : formatHoursMinutes(entry.totalHours)}
                    </p>
                    <p className="text-[12px] text-[var(--ink-faint)] tabular">
                      {entry.startTime && entry.endTime ? formatHoursMinutes(entry.totalHours) : null}
                      {entry.note ? (entry.startTime && entry.endTime ? ` · ${entry.note}` : entry.note) : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[14px] font-semibold text-[var(--work-strong)] tabular">{formatCurrency(entry.netSalary)}</span>
                    <ChevronRight size={16} className="text-[var(--ink-faint)]" />
                  </div>
                </button>
              ))}
            </div>

            {entries.length > 0 && (
              <div className="flex justify-between items-center bg-[var(--paper)] border border-[var(--border)] rounded-xl px-4 py-3 mb-4">
                <span className="text-[13px] font-medium text-[var(--ink-soft)]">{t('Day total')}: {formatHoursMinutes(dayTotalHours)}</span>
                <span className="text-[15px] font-bold text-[var(--ink)] tabular">{formatCurrency(dayTotalNet)}</span>
              </div>
            )}

            <Button variant="secondary" fullWidth onClick={openAddForm}>
              <span className="flex items-center justify-center gap-2">
                <Plus size={16} />
                {t("Add another time")}
              </span>
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] text-[var(--ink-faint)] font-medium">{activeEntryId ? t('Edit Time') : t('Add Time')}</p>
                <h2 className="text-[17px] sm:text-[18px] font-semibold text-[var(--ink)]">{dateLabel}</h2>
              </div>
              <button onClick={onClose} aria-label={t("Close")} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--border-soft)]">
                <X size={18} className="text-[var(--ink-soft)]" />
              </button>
            </div>

            <div className="mb-3">
              <h3 className="text-[13px] font-medium text-[var(--ink-soft)] mb-2">{t('Enter hours')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label={t("Start Time")} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} error={errors.hours} />
                <Input label={t("End Time")} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} error={errors.hours} />
              </div>
              <p className="text-[13px] font-medium text-[var(--ink-soft)] mt-2 text-center">
                {t("Auto-calculated:")} <span className="font-semibold text-[var(--ink)] tabular">{formatHoursMinutes(numHours + numMinutes / 60)}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Input label={t("Hourly Rate")} type="number" inputMode="numeric" min={0} suffix={currencySymbol} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} error={errors.hourlyRate} />
              <Input label={t("Tax Rate")} type="number" inputMode="decimal" min={0} max={100} step={0.1} suffix="%" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} error={errors.taxRate} />
            </div>

            <Input label={t("Note (optional)")} type="text" placeholder={t("e.g. Morning shift")} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className="mb-4" />

            <div className="bg-[var(--paper)] border border-[var(--border)] rounded-xl px-4 py-3 mb-5 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[var(--ink-soft)]">{t("Gross Salary")}</span>
                <span className="tabular font-medium text-[var(--ink)]">{formatCurrency(calc.grossSalary)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[var(--ink-soft)]">Tax ({numTax || 0}%)</span>
                <span className="tabular font-medium text-[var(--negative)]">{formatSignedCurrency(-calc.taxAmount)}</span>
              </div>
              <div className="ledger-rule h-px w-full my-1" />
              <div className="flex justify-between text-[15px]">
                <span className="font-semibold text-[var(--ink)]">{t("Net Salary")}</span>
                <span className="tabular font-bold text-[var(--work-strong)]">{formatCurrency(calc.netSalary)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {activeEntryId && (
                <Button variant="secondary" onClick={() => setConfirmDelete(true)} aria-label={t("Delete this time")} disabled={saving}>
                  <Trash2 size={17} className="text-[var(--negative)]" />
                </Button>
              )}
              <Button variant="secondary" fullWidth onClick={handleCancelForm} disabled={saving}>
                {t("Cancel")}
              </Button>
              <Button variant="primary" fullWidth onClick={handleSave} disabled={saving}>
                {saving ? t('Saving...') : activeEntryId ? t('Save Changes') : t('Save')}
              </Button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("Delete this time entry?")}
        description={t("This will permanently remove this time and its salary from the day.")}
        confirmLabel={t("Delete")}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}



