import { formatNumber } from '@/utils/currencyUtils';
import { formatHoursMinutes } from '@/utils/salaryCalculations';

export function CalendarDay({ cell, record, isSelected, onClick }) {
  const { isCurrentMonth, isToday, weekday, day } = cell;
  const isSunday = weekday === 0;
  const isSaturday = weekday === 6;

  let dateColor = 'text-[var(--ink)]';
  if (!isCurrentMonth) dateColor = 'text-[var(--ink-faint)]';
  else if (isSunday) dateColor = 'text-[var(--sunday)]';
  else if (isSaturday) dateColor = 'text-[var(--saturday)]';

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl min-h-[64px] sm:min-h-[76px]
        transition-colors duration-150 border
        ${isSelected ? 'bg-[var(--selected-soft)] border-[var(--selected)]' : 'border-transparent hover:bg-[var(--border-soft)]'}
        ${!isCurrentMonth ? 'opacity-40' : ''}
      `}
    >
      <span
        className={`text-[13px] font-medium tabular w-6 h-6 flex items-center justify-center rounded-full
          ${isToday ? 'bg-[var(--ink)] text-[var(--paper)]' : dateColor}
        `}
      >
        {day}
      </span>

      {record && (
        <div className="mt-1 flex flex-col items-center gap-0.5 w-full px-0.5">
          <span className="text-[10px] leading-none font-semibold px-1.5 py-1 rounded-md bg-[var(--work-soft)] text-[var(--work-strong)] tabular whitespace-nowrap">
            {formatHoursMinutes(record.totalHours)}
          </span>
          <span className="text-[10px] leading-none text-[var(--ink-soft)] tabular hidden sm:block">
            ₩{formatNumber(record.netSalary)}
          </span>
        </div>
      )}
    </button>
  );
}
