import { currentMonth } from "@/lib/dateRange";
import { parsePostcodesInput } from "@/lib/postcodes";
import { bucketFor } from "@/lib/theme";
import { CrimeRecord, InitialParams, RawCrime } from "@/types/dashboard";

function getParam(
  search: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
): string {
  if (search instanceof URLSearchParams) {
    return search.get(key) || '';
  }
  const value = search[key];
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

export function parseSearchParams(
  search: URLSearchParams | Record<string, string | string[] | undefined>,
): InitialParams {
  const { valid } = parsePostcodesInput(getParam(search, 'postcodes'));
  const today = currentMonth();
  return {
    postcodes: valid,
    from: getParam(search, 'from') || today,
    to: getParam(search, 'to') || today,
  };
}

export function updateQueryString(postcodes: string[], from: string, to: string) {
  const params = new URLSearchParams();
  if (postcodes.length > 0) params.set('postcodes', postcodes.join(','));
  params.set('from', from);
  params.set('to', to);
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
}

export function clearQueryString() {
  window.history.replaceState(null, '', window.location.pathname);
}

export function normalize(raw: RawCrime[], postcode: string): CrimeRecord[] {
  return raw.map((c) => {
    const loc = c.location;
    const hasLocation = Boolean(loc && loc.latitude && loc.longitude);
    return {
      id: `${postcode}-${c.id ?? c.persistent_id}`,
      postcode,
      hasLocation,
      lat: hasLocation && loc ? parseFloat(loc.latitude) : null,
      lng: hasLocation && loc ? parseFloat(loc.longitude) : null,
      category: c.category,
      bucket: bucketFor(c.category),
      street: loc?.street?.name?.replace(/^on or near\s*/i, '') || 'Unknown location',
      month: c.month,
      outcome: c.outcome_status?.category || 'No outcome recorded yet',
    };
  });
}