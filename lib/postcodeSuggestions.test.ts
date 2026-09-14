import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();

describe('suggestPostcodes', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('returns prefix matches for a partial outcode', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 200, result: ['EN10 6AA', 'EN10 6AB'] }),
    });

    const { suggestPostcodes } = await import('@/lib/postcodeSuggestions');
    await expect(suggestPostcodes('en1')).resolves.toEqual(['EN10 6AA', 'EN10 6AB']);
  });

  it('after a trailing space, returns postcodes for that outcode rather than EN10', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const path = decodeURIComponent(String(url));
      const result = path.includes('/EN1 1A/')
        ? ['EN1 1AA', 'EN1 1AL']
        : path.includes('/EN1 2A/')
          ? ['EN1 2AA']
          : [];
      return { ok: true, json: async () => ({ status: 200, result }) };
    });

    const { suggestPostcodes } = await import('@/lib/postcodeSuggestions');
    await expect(suggestPostcodes('en1 ')).resolves.toEqual(['EN1 1AA', 'EN1 1AL', 'EN1 2AA']);
  });
});
