'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'crime-dashboard:postcode-history';
const MAX_ENTRIES = 25;

export interface HistoryEntry {
  postcode: string;
  lastSearchedAt: string; // ISO timestamp
}

function readStorage(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private browsing, disabled storage, corrupted value, etc. - fall back
    // to an empty (non-persisted) history rather than throwing.
    return [];
  }
}

function writeStorage(entries: HistoryEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore - history just won't persist this time.
  }
}

// Stretch goal: a list of every postcode ever searched, persisted in
// localStorage so it survives refreshes and new tabs on this browser.
export function usePostcodeHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // Deferred to a microtask so this setState call doesn't run
    // synchronously within the effect body (avoids cascading renders).
    queueMicrotask(() => {
      setEntries(readStorage());
    });
  }, []);

  const record = useCallback((postcodes: string[]) => {
    if (postcodes.length === 0) return;
    setEntries((prev) => {
      const now = new Date().toISOString();
      const byPostcode = new Map(prev.map((e) => [e.postcode, e]));
      postcodes.forEach((pc) => byPostcode.set(pc, { postcode: pc, lastSearchedAt: now }));
      const next = Array.from(byPostcode.values())
        .sort((a, b) => (a.lastSearchedAt < b.lastSearchedAt ? 1 : -1))
        .slice(0, MAX_ENTRIES);
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((postcode: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.postcode !== postcode);
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    writeStorage([]);
  }, []);

  return { entries, record, remove, clear };
}
