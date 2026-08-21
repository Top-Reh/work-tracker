import { buildCalendarGrid, getWeekdayLabels } from '@/utils/dateUtils';
import { CalendarDay } from '@/components/CalendarDay/CalendarDay';

export function Calendar({ year, month, recordsByDate, selectedDate, onSelectDate }) {
  const cells = buildCalendarGrid(year, month);
  const weekdayLabels = getWeekdayLabels();

  return (
    <div className="px-2 sm:px-4">
      <div className="grid grid-cols-7 mb-1">
        {weekdayLabels.map((label, i) => (
          <div
            key={label}
            className={`text-center text-[11px] font-semibold py-2 tracking-wide
              ${i === 0 ? 'text-[var(--sunday)]' : i === 6 ? 'text-[var(--saturday)]' : 'text-[var(--ink-faint)]'}
            `}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {cells.map((cell) => (
          <CalendarDay
            key={cell.dateKey}
            cell={cell}
            record={recordsByDate.get(cell.dateKey)}
            isSelected={selectedDate === cell.dateKey}
            onClick={() => onSelectDate(cell.dateKey)}
          />
        ))}
      </div>
    </div>
  );
}
