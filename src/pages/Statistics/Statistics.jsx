import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useYearRecords } from '@/hooks/useWorkRecords';
import { calculateMonthlySummary, formatHoursMinutes } from '@/utils/salaryCalculations';
import { formatCurrency, formatSignedCurrency } from '@/utils/currencyUtils';
import { getMonthShortLabel } from '@/utils/dateUtils';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function Statistics() {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const { records, loading } = useYearRecords(user?.uid, year);

  const monthlyBreakdown = useMemo(() => {
    const byMonth = {};
    for (let i = 0; i < 12; i++) byMonth[i] = [];
    records.forEach((r) => {
      const monthIndex = Number(r.date.slice(5, 7)) - 1;
      byMonth[monthIndex].push(r);
    });
    return Array.from({ length: 12 }, (_, i) => ({
      month: i,
      summary: calculateMonthlySummary(byMonth[i]),
    }));
  }, [records]);

  const yearTotal = useMemo(() => calculateMonthlySummary(records), [records]);

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setYear((y) => y - 1)}
          aria-label="Previous year"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--border-soft)]"
        >
          <ChevronLeft size={20} className="text-[var(--ink-soft)]" />
        </button>
        <h1 className="text-[18px] font-bold text-[var(--ink)] tabular">{year}</h1>
        <button
          onClick={() => setYear((y) => y + 1)}
          aria-label="Next year"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--border-soft)]"
        >
          <ChevronRight size={20} className="text-[var(--ink-soft)]" />
        </button>
      </div>

      <Card className="p-5 mb-5 text-center">
        <p className="text-[13px] font-medium text-[var(--ink-faint)] mb-1">Year Total Net Salary</p>
        <p className="ledger-total tabular text-[32px] font-bold text-[var(--ink)] mb-3">{formatCurrency(yearTotal.netSalary)}</p>
        <div className="grid grid-cols-3 gap-2 text-left">
          <div>
            <p className="text-[11px] text-[var(--ink-faint)] uppercase">Hours</p>
            <p className="text-[14px] font-semibold tabular">{formatHoursMinutes(yearTotal.totalHours)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--ink-faint)] uppercase">Gross</p>
            <p className="text-[14px] font-semibold tabular">{formatCurrency(yearTotal.grossSalary)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--ink-faint)] uppercase">Tax</p>
            <p className="text-[14px] font-semibold tabular text-[var(--negative)]">{formatSignedCurrency(-yearTotal.taxAmount)}</p>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {monthlyBreakdown.map(({ month, summary }) => (
            <Card key={month} className={`px-4 py-3 flex items-center justify-between ${summary.recordCount === 0 ? 'opacity-50' : ''}`}>
              <div>
                <p className="text-[14px] font-semibold text-[var(--ink)]">{getMonthShortLabel(month)}</p>
                <p className="text-[12px] text-[var(--ink-faint)] tabular">
                  {summary.recordCount === 0 ? 'No records' : formatHoursMinutes(summary.totalHours)}
                </p>
              </div>
              <p className="tabular font-semibold text-[15px] text-[var(--ink)]">{formatCurrency(summary.netSalary)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
