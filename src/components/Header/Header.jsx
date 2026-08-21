import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthLabel } from '@/utils/dateUtils';

export function Header({ year, month, onPrevMonth, onNextMonth, onToday, isCurrentMonth }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      <button
        onClick={onPrevMonth}
        aria-label="Previous month"
        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--border-soft)] active:scale-95 transition-all"
      >
        <ChevronLeft size={20} className="text-[var(--ink-soft)]" />
      </button>

      <div className="flex flex-col items-center">
        <h1 className="text-[16px] font-semibold text-[var(--ink)] tabular">{getMonthLabel(year, month)}</h1>
        {!isCurrentMonth && (
          <button onClick={onToday} className="text-[12px] text-[var(--selected)] font-medium mt-0.5">
            Today
          </button>
        )}
      </div>

      <button
        onClick={onNextMonth}
        aria-label="Next month"
        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--border-soft)] active:scale-95 transition-all"
      >
        <ChevronRight size={20} className="text-[var(--ink-soft)]" />
      </button>
    </div>
  );
}
