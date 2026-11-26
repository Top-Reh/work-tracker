import { StatCard } from '@/components/StatCard/StatCard';
import { formatHoursMinutes } from '@/utils/salaryCalculations';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';

export function SalarySummary({ monthLabel, summary }) {
  const { t } = useLanguage();
  const { formatCurrency, formatSignedCurrency } = useCurrency();
  return (
    <div className="px-4 pt-6 pb-5 text-center">
      <p className="text-[13px] font-medium text-[var(--ink-faint)] tracking-wide mb-2">{monthLabel} · {t("Net Salary")}</p>
      <p className="ledger-total tabular text-[30px] sm:text-[42px] leading-none font-bold text-[var(--ink)] mb-1 break-all px-2">
        {formatCurrency(summary.netSalary)}
      </p>
      <div className="ledger-rule h-px w-24 mx-auto my-4" />
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <StatCard label={t("Hours")} value={formatHoursMinutes(summary.totalHours)} />
        <StatCard label={t("Gross")} value={formatCurrency(summary.grossSalary)} />
        <StatCard label={t("Tax")} value={formatSignedCurrency(-summary.taxAmount)} tone="negative" />
        <StatCard label={t("Net")} value={formatCurrency(summary.netSalary)} tone="positive" />
      </div>
    </div>
  );
}

