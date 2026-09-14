import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePostcodeHistory } from '@/lib/usePostcodeHistory';

const STORAGE_KEY = 'crime-dashboard:postcode-history';

describe('usePostcodeHistory', () => {
  it('loads persisted history', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ postcode: 'EC1A 1BB', lastSearchedAt: '2026-01-01T00:00:00.000Z' }])
    );

    const { result } = renderHook(() => usePostcodeHistory());

    await waitFor(() => {
      expect(result.current.entries).toEqual([
        { postcode: 'EC1A 1BB', lastSearchedAt: '2026-01-01T00:00:00.000Z' },
      ]);
    });
  });

  it('records postcodes newest first and persists them', async () => {
    const { result } = renderHook(() => usePostcodeHistory());

    act(() => {
      result.current.record(['SW1A 1AA']);
    });

    await waitFor(() => {
      expect(result.current.entries[0]?.postcode).toBe('SW1A 1AA');
    });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')).toEqual(
      expect.arrayContaining([expect.objectContaining({ postcode: 'SW1A 1AA' })])
    );
  });

  it('removes a postcode from history', async () => {
    const { result } = renderHook(() => usePostcodeHistory());

    act(() => {
      result.current.record(['SW1A 1AA', 'EC1A 1BB']);
    });
    await waitFor(() => expect(result.current.entries).toHaveLength(2));

    act(() => {
      result.current.remove('SW1A 1AA');
    });

    await waitFor(() => {
      expect(result.current.entries.map((e) => e.postcode)).toEqual(['EC1A 1BB']);
    });
  });

  it('clears searched postcodes from state and storage', async () => {
    const { result } = renderHook(() => usePostcodeHistory());

    act(() => {
      result.current.record(['SW1A 1AA']);
    });
    await waitFor(() => expect(result.current.entries).toHaveLength(1));

    act(() => {
      result.current.clear();
    });

    await waitFor(() => expect(result.current.entries).toEqual([]));
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('[]');
  });
});
