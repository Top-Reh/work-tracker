import { buildCalendarGrid, getWeekdayLabels } from '@/utils/dateUtils';
import { CalendarDay } from '@/components/CalendarDay/CalendarDay';
import { useLanguage } from '@/context/LanguageContext';

const BURMESE_WEEKDAYS = ['\u1010\u1014\u1004\u103a\u1039\u1002\u1014\u103d\u1031','\u1010\u1014\u1004\u103a\u1039\u101c\u102c','\u1021\u1004\u103a\u1039\u1002\u102b','\u1017\u102f\u1012\u1039\u1013\u101f\u1030\u1038','\u1000\u103c\u102c\u101e\u1015\u1010\u1031\u1038','\u101e\u1031\u102c\u1000\u103c\u102c','\u1005\u1014\u1031'];

export function Calendar({ year, month, recordsByDate, selectedDate, onSelectDate }) {
  const { language } = useLanguage();
  const cells = buildCalendarGrid(year, month);
  const weekdayLabels = language === 'my' ? BURMESE_WEEKDAYS : getWeekdayLabels();

  return (
    <div className="px-2 sm:px-4">
      <div className="grid grid-cols-7 mb-1">
        {weekdayLabels.map((label, i) => (
          <div key={label} className={`text-center text-[11px] font-semibold py-2 tracking-wide
            ${i === 0 ? 'text-[var(--sunday)]' : i === 6 ? 'text-[var(--saturday)]' : 'text-[var(--ink-faint)]'}`}>
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {cells.map((cell) => (
          <CalendarDay key={cell.dateKey} cell={cell} record={recordsByDate.get(cell.dateKey)}
            isSelected={selectedDate === cell.dateKey} onClick={() => onSelectDate(cell.dateKey)} />
        ))}
      </div>
    </div>
  );
}
