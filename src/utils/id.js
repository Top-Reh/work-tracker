/** A short, unique-enough id for a time entry within a day's record. Not security-sensitive. */
export function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
