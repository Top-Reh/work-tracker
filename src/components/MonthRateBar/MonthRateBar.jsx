import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { formatCurrency } from '@/utils/currencyUtils';

export function MonthRateBar({ monthLabel, hourlyRate, taxRate, recordCount, saving, onApply }) {
  const [editing, setEditing] = useState(false);
  const [draftRate, setDraftRate] = useState(String(hourlyRate));
  const [draftTax, setDraftTax] = useState(String(taxRate));
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  function openEditor() {
    setDraftRate(String(hourlyRate));
    setDraftTax(String(taxRate));
    setError('');
    setEditing(true);
  }

  function handleReview() {
    const rate = Number(draftRate);
    const tax = Number(draftTax);
    if (Number.isNaN(rate) || rate < 0) return setError('Hourly rate must be 0 or greater.');
    if (Number.isNaN(tax) || tax < 0 || tax > 100) return setError('Tax rate must be between 0 and 100.');
    if (rate === hourlyRate && tax === taxRate) {
      setEditing(false);
      return;
    }
    setError('');
    setConfirmOpen(true);
  }

  function handleConfirm() {
    setConfirmOpen(false);
    setEditing(false);
    onApply(Number(draftRate), Number(draftTax));
  }

  if (!editing) {
    return (
      <div className="mx-4 mb-3 flex items-center justify-between rounded-xl bg-[var(--paper-raised)] border border-[var(--border)] px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] text-[var(--ink-faint)] uppercase tracking-wide">{monthLabel} rate</p>
          <p className="text-[13px] font-semibold text-[var(--ink)] tabular truncate">
            {formatCurrency(hourlyRate)}/hr · {taxRate}% tax
          </p>
        </div>
        <button
          onClick={openEditor}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-[var(--selected)] hover:bg-[var(--selected-soft)]"
        >
          <Pencil size={13} />
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-3 rounded-xl bg-[var(--paper-raised)] border border-[var(--selected)] px-4 py-3">
      <p className="text-[12px] font-medium text-[var(--ink)] mb-2">Set rate for {monthLabel} only</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Input label="Hourly Rate" type="number" inputMode="numeric" min={0} suffix="₩" value={draftRate} onChange={(e) => setDraftRate(e.target.value)} />
        <Input label="Tax Rate" type="number" inputMode="decimal" min={0} max={100} step={0.1} suffix="%" value={draftTax} onChange={(e) => setDraftTax(e.target.value)} />
      </div>
      {error && <p className="text-[12px] text-[var(--negative)] mb-2">{error}</p>}
      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={() => setEditing(false)} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" fullWidth onClick={handleReview} disabled={saving}>
          {saving ? 'Applying…' : 'Apply'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Change ${monthLabel}'s rate?`}
        description={
          recordCount > 0
            ? `This recalculates all ${recordCount} record${recordCount === 1 ? '' : 's'} already logged this month using the new rate and tax. Other months are not affected. This cannot be undone.`
            : `This sets the default rate for new records you add this month. Other months are not affected.`
        }
        confirmLabel="Yes, apply"
        danger={recordCount > 0}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
