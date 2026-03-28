/**
 * Parse a duration string like "2 DAYS", "1 DAY", "20 HRS" into a number of days.
 * Hours are rounded up to the next day.
 * Returns NaN if the string can't be parsed.
 */
function parseDuration(daysStr: string): number {
  const trimmed = daysStr.trim().toUpperCase();
  if (!trimmed) return NaN;

  const match = trimmed.match(/^(\d+)\s*(.*)?$/);
  if (!match) return NaN;

  const value = parseInt(match[1], 10);
  const unit = (match[2] ?? '').trim();

  if (unit.startsWith('HR')) {
    return Math.ceil(value / 24);
  }

  // "DAYS", "DAY", bare number, or any other suffix — treat as days
  return value;
}

/**
 * Parse a date string in YYYY-MM-DD or M/D/YYYY format into UTC components.
 * Returns null if unparseable.
 */
function parseDate(dateStr: string): { year: number; month: number; day: number } | null {
  const trimmed = dateStr.trim();

  // Try YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10) - 1,
      day: parseInt(isoMatch[3], 10),
    };
  }

  // Try M/D/YYYY
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    return {
      year: parseInt(usMatch[3], 10),
      month: parseInt(usMatch[1], 10) - 1,
      day: parseInt(usMatch[2], 10),
    };
  }

  return null;
}

export function computeDatePlusDays(dateStr: string, daysStr: string): string {
  if (!daysStr || daysStr.trim() === '') return '';

  const days = parseDuration(daysStr);
  if (isNaN(days)) return '';

  const parsed = parseDate(dateStr);
  if (!parsed) return '';

  const date = new Date(Date.UTC(parsed.year, parsed.month, parsed.day + days));
  if (isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
}
