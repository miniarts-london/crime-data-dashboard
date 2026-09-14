import { describe, expect, it } from 'vitest';
import { monthsBetween } from '@/lib/dateRange';

describe('monthsBetween', () => {
  it('returns an inclusive month list', () => {
    expect(monthsBetween('2026-01', '2026-03')).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('swaps reversed ranges', () => {
    expect(monthsBetween('2026-03', '2026-01')).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('returns a single month when from and to are the same', () => {
    expect(monthsBetween('2026-06', '2026-06')).toEqual(['2026-06']);
  });
});
