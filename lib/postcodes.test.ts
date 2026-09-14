import { describe, expect, it } from 'vitest';
import { normalizePostcode, parsePostcodesInput } from '@/lib/postcodes';

describe('parsePostcodesInput', () => {
  it('normalizes, validates, and dedupes UK postcodes', () => {
    expect(parsePostcodesInput('sw1a 1aa, SW1A 1AA, hello, EC1A 1BB')).toEqual({
      valid: ['SW1A 1AA', 'EC1A 1BB'],
      invalid: ['hello'],
    });
  });

  it('returns empty lists for blank input', () => {
    expect(parsePostcodesInput('')).toEqual({ valid: [], invalid: [] });
    expect(parsePostcodesInput('   ,  ,')).toEqual({ valid: [], invalid: [] });
  });
});

describe('normalizePostcode', () => {
  it('uppercases and collapses spaces', () => {
    expect(normalizePostcode('  sw1a   1aa ')).toBe('SW1A 1AA');
  });
});
