// Live "type SW1A and see real SW1A postcodes" suggestions for the search
// bar, backed by postcodes.io's free autocomplete endpoint. This is
// deliberately separate from lib/police.ts: getthedata.com (used there for
// the actual postcode -> lat/lng lookup that powers a search) only supports
// an exact, single-postcode lookup, so it can't drive a prefix-based
// autocomplete on its own.
const AUTOCOMPLETE_BASE =
  process.env.NEXT_PUBLIC_POSTCODE_AUTOCOMPLETE_BASE_URL || 'https://api.postcodes.io/postcodes';

// Outward code only, e.g. EN1, N1, SW1A. Used to detect "user typed the
// district and a space" so we don't treat EN1 as a prefix of EN10.
const OUTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?$/;

interface AutocompleteResponse {
  status: number;
  result: string[] | null;
}

const suggestionCache = new Map<string, string[]>();

async function fetchAutocomplete(query: string, signal?: AbortSignal): Promise<string[]> {
  const url = `${AUTOCOMPLETE_BASE}/${encodeURIComponent(query)}/autocomplete?limit=10`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const body: AutocompleteResponse = await res.json();
  return body.result ?? [];
}

function uniquePostcodes(values: string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const value of values) {
    const key = value.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(value);
  }
  return next;
}

// postcodes.io prefix-matches EN1 to EN10, so "EN1" never returns EN1 1AA.
// Once the outcode is complete (trailing space), probe each inward sector.
async function suggestForCompleteOutcode(outcode: string, signal?: AbortSignal): Promise<string[]> {
  const batches = await Promise.all(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => fetchAutocomplete(`${outcode} ${digit}A`, signal))
  );
  const prefix = `${outcode} `;
  return uniquePostcodes(batches.flat().filter((pc) => pc.toUpperCase().startsWith(prefix))).slice(0, 10);
}

export async function suggestPostcodes(query: string, signal?: AbortSignal): Promise<string[]> {
  const hadTrailingSpace = /\s$/.test(query);
  const trimmed = query.trim().toUpperCase().replace(/\s+/g, ' ');
  if (trimmed.length < 2) return [];

  const key = `${trimmed}|${hadTrailingSpace ? 'spaced' : 'prefix'}`;
  const cached = suggestionCache.get(key);
  if (cached) return cached;

  let results: string[];
  if (hadTrailingSpace && OUTCODE_REGEX.test(trimmed)) {
    results = await suggestForCompleteOutcode(trimmed, signal);
    if (results.length === 0) {
      results = await fetchAutocomplete(trimmed, signal);
    }
  } else {
    results = await fetchAutocomplete(trimmed, signal);
  }

  suggestionCache.set(key, results);
  return results;
}
