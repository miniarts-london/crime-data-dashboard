import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();

describe('police API helpers', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('geocodes a matching postcode', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'match',
        data: { postcode: 'SW1A 1AA', latitude: '51.501', longitude: '-0.142' },
      }),
    });

    const { geocodePostcode } = await import('@/lib/police');
    await expect(geocodePostcode('sw1a 1aa')).resolves.toEqual({
      lat: 51.501,
      lng: -0.142,
      label: 'SW1A 1AA',
    });
  });

  it('reuses a cached geocode result', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'match',
        data: { postcode: 'W1A 1AA', latitude: '51.52', longitude: '-0.14' },
      }),
    });

    const { geocodePostcode } = await import('@/lib/police');
    await geocodePostcode('W1A 1AA');
    await geocodePostcode('W1A 1AA');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('treats a 404 crime response as an empty month', async () => {
    fetchMock.mockResolvedValue({ status: 404, ok: false, json: async () => null });
    const { fetchCrimes } = await import('@/lib/police');
    await expect(fetchCrimes(51.5, -0.12, '2026-01')).resolves.toEqual([]);
  });

  it('explains a 503 crime response', async () => {
    fetchMock.mockResolvedValue({ status: 503, ok: false, json: async () => null });
    const { fetchCrimes } = await import('@/lib/police');
    await expect(fetchCrimes(51.6, -0.13, '2026-02')).rejects.toThrow(/too many crimes/i);
  });
});
