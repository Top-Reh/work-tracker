/**
 * All dates in this app are handled as LOCAL calendar dates, stored as
 * "YYYY-MM-DD" strings. We deliberately avoid Date -> toISOString() for
 * storage because toISOString() converts to UTC first, which can shift
 * a date to the previous/next day for users in timezones like KST (UTC+9)
 * depending on the time of day. Instead we build/parse the string using
 * local getFullYear/getMonth/getDate.
 */

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function pad2(n) {
  return n.toString().padStart(2, '0');
}

/** Converts a local Date object into a "YYYY-MM-DD" string using local time components. */
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Parses a "YYYY-MM-DD" string into a local Date at midnight (no UTC involved). */
export function fromDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey() {
  return toDateKey(new Date());
}

export function getWeekdayLabels() {
  return WEEKDAY_LABELS;
}

export function getMonthLabel(year, month) {
  return `${MONTH_LABELS[month]} ${year}`;
}

export function getMonthShortLabel(month) {
  return MONTH_LABELS[month];
}

/**
 * Builds a full 6-row (42-cell) calendar grid for the given year/month (0-indexed month),
 * including the trailing/leading days from adjacent months so the grid stays rectangular.
 * Each cell: { date, dateKey, day, isCurrentMonth, isToday, weekday }
 */
export function buildCalendarGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startWeekday);

  const todayStr = todayKey();
  const cells = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const dateKey = toDateKey(date);
    cells.push({
      date,
      dateKey,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayStr,
      weekday: date.getDay(),
    });
  }

  return cells;
}

export function addMonths(year, month, delta) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function isSunday(weekday) {
  return weekday === 0;
}

export function isSaturday(weekday) {
  return weekday === 6;
}
