import { StatCard } from '@/components/StatCard/StatCard';
import { formatCurrency, formatSignedCurrency } from '@/utils/currencyUtils';
import { formatHoursMinutes } from '@/utils/salaryCalculations';

export function SalarySummary({ monthLabel, summary }) {
  return (
    <div className="px-4 pt-6 pb-5 text-center">
      <p className="text-[13px] font-medium text-[var(--ink-faint)] tracking-wide mb-2">{monthLabel} · Net Salary</p>
      <p className="ledger-total tabular text-[42px] leading-none font-bold text-[var(--ink)] mb-1">
        {formatCurrency(summary.netSalary)}
      </p>
      <div className="ledger-rule h-px w-24 mx-auto my-4" />
      <div className="flex gap-2">
        <StatCard label="Hours" value={formatHoursMinutes(summary.totalHours)} />
        <StatCard label="Gross" value={formatCurrency(summary.grossSalary)} />
        <StatCard label="Tax" value={formatSignedCurrency(-summary.taxAmount)} tone="negative" />
        <StatCard label="Net" value={formatCurrency(summary.netSalary)} tone="positive" />
      </div>
    </div>
  );
}
