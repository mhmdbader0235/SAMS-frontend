/**
 * Timezone-aware date helper tests (Vitest).
 */

import { describe, it, expect } from 'vitest';
import { toDateTimeLocal, fromDateTimeLocal, formatDate, firstDayOfWeek, formatMoney } from '../format.js';

describe('formatMoney', () => {
  it('shows zero decimal places for a zero-minor-unit currency (JPY)', () => {
    expect(formatMoney('12.5', 'JPY')).toBe('¥13');
  });

  it('shows three decimal places for a three-minor-unit currency (JOD)', () => {
    expect(formatMoney('12.5', 'JOD')).toMatch(/12\.500/);
  });

  it('defaults a missing value to zero', () => {
    expect(formatMoney(undefined, 'USD')).toMatch(/0\.00/);
  });
});

describe('toDateTimeLocal / fromDateTimeLocal round trip', () => {
  const zones = ['Asia/Amman', 'America/New_York', 'Pacific/Chatham', 'Australia/Lord_Howe'];

  // A handful of ordinary instants, plus one inside each zone's DST
  // transition window (spring-forward / fall-back dates for 2026).
  const instants = [
    '2026-01-15T12:00:00.000Z',
    '2026-06-15T08:30:00.000Z',
    '2026-11-01T00:00:00.000Z',
  ];

  const dstWindowInstants = {
    'Asia/Amman': '2026-03-27T21:00:00.000Z', // Jordan DST start (no longer observed, but stable zone)
    'America/New_York': '2026-03-08T07:00:00.000Z', // US spring-forward
    'Pacific/Chatham': '2026-04-05T02:45:00.000Z', // Chatham Islands DST end (45-min offset zone)
    'Australia/Lord_Howe': '2026-04-05T02:30:00.000Z', // Lord Howe 30-min DST shift
  };

  for (const tz of zones) {
    for (const iso of [...instants, dstWindowInstants[tz]]) {
      it(`round-trips ${iso} through ${tz}`, () => {
        const local = toDateTimeLocal(iso, tz);
        const back = fromDateTimeLocal(local, tz);
        expect(back).toBe(iso);
      });
    }
  }

  it('returns empty string for falsy input', () => {
    expect(toDateTimeLocal('', 'UTC')).toBe('');
    expect(fromDateTimeLocal('', 'UTC')).toBe('');
  });
});

describe('formatDate', () => {
  it('formats a UTC instant in the given IANA zone', () => {
    const out = formatDate('2026-06-15T12:00:00.000Z', {
      timeZone: 'Asia/Amman',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    expect(out).toMatch(/15/); // 12:00 UTC is 15:00 in Asia/Amman (UTC+3)
  });

  it('returns empty string for falsy input', () => {
    expect(formatDate('', {})).toBe('');
  });
});

describe('firstDayOfWeek', () => {
  it('defaults to Sunday when no weekend is configured', () => {
    expect(firstDayOfWeek([])).toBe(0);
    expect(firstDayOfWeek(undefined)).toBe(0);
  });

  it('returns Sunday for a Friday/Saturday weekend', () => {
    expect(firstDayOfWeek(['Friday', 'Saturday'])).toBe(0);
  });

  it('returns Monday for a Saturday/Sunday weekend', () => {
    expect(firstDayOfWeek(['Saturday', 'Sunday'])).toBe(1);
  });
});
