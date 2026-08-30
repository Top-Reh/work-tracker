/**
 * Converts "HH:MM" start/end clock times into { hours, minutes } worked.
 * If end is earlier than or equal to start, the shift is assumed to run
 * past midnight (e.g. 22:00 -> 06:00 is an 8 hour overnight shift).
 */
export function calculateDurationFromTimes(startTime, endTime) {
  if (!startTime || !endTime) return { hours: 0, minutes: 0 };

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startTotal = startH * 60 + startM;
  let endTotal = endH * 60 + endM;

  if (endTotal <= startTotal) {
    endTotal += 24 * 60; // overnight shift, wraps past midnight
  }

  const diffMinutes = endTotal - startTotal;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return { hours, minutes };
}

/**
 * Converts hours + minutes into a decimal total, e.g. 8h 30m -> 8.5
 */
export function toTotalHours(hours, minutes) {
  const total = hours + minutes / 60;
  // round to 2 decimals to avoid floating point drift (8.5000000001)
  return Math.round(total * 100) / 100;
}

export function calculateGrossSalary(hours, minutes, hourlyRate) {
  const totalHours = toTotalHours(hours, minutes);
  return Math.round(totalHours * hourlyRate);
}

export function calculateTax(grossSalary, taxRate) {
  return Math.round(grossSalary * (taxRate / 100));
}

export function calculateNetSalary(grossSalary, taxRate) {
  return grossSalary - calculateTax(grossSalary, taxRate);
}

/**
 * Returns { totalHours, grossSalary, taxAmount, netSalary } for a single work entry.
 */
export function calculateRecord(hours, minutes, hourlyRate, taxRate) {
  const totalHours = toTotalHours(hours, minutes);
  const grossSalary = calculateGrossSalary(hours, minutes, hourlyRate);
  const taxAmount = calculateTax(grossSalary, taxRate);
  const netSalary = grossSalary - taxAmount;
  return { totalHours, grossSalary, taxAmount, netSalary };
}

/**
 * Sums an array of work records into { totalHours, grossSalary, taxAmount, netSalary, recordCount }.
 */
export function calculateMonthlySummary(records) {
  return records.reduce(
    (acc, r) => ({
      totalHours: Math.round((acc.totalHours + r.totalHours) * 100) / 100,
      grossSalary: acc.grossSalary + r.grossSalary,
      taxAmount: acc.taxAmount + r.taxAmount,
      netSalary: acc.netSalary + r.netSalary,
      recordCount: acc.recordCount + 1,
    }),
    { totalHours: 0, grossSalary: 0, taxAmount: 0, netSalary: 0, recordCount: 0 }
  );
}

/**
 * Formats a decimal hour total as "8h 30m"
 */
export function formatHoursMinutes(totalHours) {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  if (minutes === 0) return `${hours}h`;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}
