// Live "type SW1A and see real SW1A postcodes" suggestions for the search
// bar, backed by postcodes.io's free autocomplete endpoint. This is
// deliberately separate from lib/police.ts: getthedata.com (used there for
// the actual postcode -> lat/lng lookup that powers a search) only supports
// an exact, single-postcode lookup, so it can't drive a prefix-based
// autocomplete on its own. See the README's Trade-offs section for why a
// third API is used here, purely for suggestions.
const AUTOCOMPLETE_BASE =
  process.env.NEXT_PUBLIC_POSTCODE_AUTOCOMPLETE_BASE_URL || 'https://api.postcodes.io/postcodes';

interface AutocompleteResponse {
  status: number;
  result: string[] | null;
}

// In-memory cache, same rationale as lib/police.ts - repeat prefixes within
// a session (e.g. backspacing then retyping) don't re-issue a request.
const suggestionCache = new Map<string, string[]>();

export async function suggestPostcodes(query: string, signal?: AbortSignal): Promise<string[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const key = trimmed.toUpperCase();
  const cached = suggestionCache.get(key);
  if (cached) return cached;

  const url = `${AUTOCOMPLETE_BASE}/${encodeURIComponent(trimmed)}/autocomplete?limit=10`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];

  const body: AutocompleteResponse = await res.json();
  const results = body.result ?? [];
  suggestionCache.set(key, results);
  return results;
}
