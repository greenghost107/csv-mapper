import { describe, it, expect } from 'vitest';
import { computeDatePlusDays } from './datePlusDays';

describe('computeDatePlusDays', () => {
  describe('YYYY-MM-DD format', () => {
    it('adds days to an ISO date', () => {
      expect(computeDatePlusDays('2025-01-06', '2 Days')).toBe('2025-01-08');
    });

    it('handles double-digit day counts', () => {
      expect(computeDatePlusDays('2025-01-06', '11 DAYS')).toBe('2025-01-17');
    });

    it('handles month/year rollover', () => {
      expect(computeDatePlusDays('2025-01-30', '5 Days')).toBe('2025-02-04');
      expect(computeDatePlusDays('2025-12-29', '5 Days')).toBe('2026-01-03');
    });
  });

  describe('M/D/YYYY format', () => {
    it('parses US-style dates', () => {
      expect(computeDatePlusDays('3/27/2026', '2 DAYS')).toBe('2026-03-29');
    });

    it('handles single-digit month and day', () => {
      expect(computeDatePlusDays('1/6/2026', '5 DAYS')).toBe('2026-01-11');
    });

    it('handles zero-padded US dates', () => {
      expect(computeDatePlusDays('03/06/2026', '11 DAYS')).toBe('2026-03-17');
    });
  });

  describe('duration parsing', () => {
    it('handles "N DAYS" (plural)', () => {
      expect(computeDatePlusDays('2025-01-01', '7 DAYS')).toBe('2025-01-08');
    });

    it('handles "N DAY" (singular)', () => {
      expect(computeDatePlusDays('2025-01-01', '1 DAY')).toBe('2025-01-02');
    });

    it('is case-insensitive', () => {
      expect(computeDatePlusDays('2025-03-01', '5 days')).toBe('2025-03-06');
    });

    it('handles bare number without suffix', () => {
      expect(computeDatePlusDays('2025-01-01', '7')).toBe('2025-01-08');
    });

    it('converts hours to days by rounding up', () => {
      // 20 HRS → ceil(20/24) = 1 day
      expect(computeDatePlusDays('2/27/2026', '20 HRS')).toBe('2026-02-28');
    });

    it('handles 48 HRS as 2 days', () => {
      expect(computeDatePlusDays('2025-01-01', '48 HRS')).toBe('2025-01-03');
    });

    it('handles "HR" singular', () => {
      expect(computeDatePlusDays('2025-01-01', '3 HR')).toBe('2025-01-02');
    });
  });

  describe('edge cases', () => {
    it('returns empty string when days string is blank', () => {
      expect(computeDatePlusDays('2025-01-06', '')).toBe('');
      expect(computeDatePlusDays('2025-01-06', '   ')).toBe('');
    });

    it('returns empty string when days string has no digits', () => {
      expect(computeDatePlusDays('2025-01-06', 'ongoing')).toBe('');
    });

    it('returns empty string when date is invalid', () => {
      expect(computeDatePlusDays('not-a-date', '2 Days')).toBe('');
      expect(computeDatePlusDays('', '2 Days')).toBe('');
    });
  });
});
