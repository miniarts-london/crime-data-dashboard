import type { RawCrime, GeocodeResult } from '@/types/dashboard';

// Both APIs are called directly from the browser, so their base URLs are
// read from NEXT_PUBLIC_* env vars (see .env.example) and fall back to the
// real public endpoints if unset - no env file is required to run the app.
// Postcode geocoding: getthedata.com Open Postcode Geo API.
const POSTCODE_BASE = process.env.NEXT_PUBLIC_POSTCODE_API_BASE_URL || 'http://api.getthedata.com/postcode';
// Street-level crime data: data.police.uk public API.
const CRIME_BASE = process.env.NEXT_PUBLIC_CRIME_API_BASE_URL || 'https://data.police.uk/api';

// In-memory caches so repeat searches (same postcode, same postcode+month)
// don't re-issue requests that have already resolved this session - part of
// keeping the number of requests down alongside the concurrency limiter.
const geocodeCache = new Map<string, GeocodeResult>();
const crimesCache = new Map<string, RawCrime[]>();

interface GetTheDataPostcodeResponse {
  status: string;
  notice?: string;
  data?: {
    postcode: string;
    latitude: string;
    longitude: string;
  };
}

export async function geocodePostcode(postcode: string): Promise<GeocodeResult> {
  const key = postcode.trim().toUpperCase();
  const cached = geocodeCache.get(key);
  if (cached) return cached;

  const clean = encodeURIComponent(postcode.trim());
  const res = await fetch(`${POSTCODE_BASE}/${clean}`);
  const body: GetTheDataPostcodeResponse | null = await res.json().catch(() => null);
  if (!res.ok || !body || body.status !== 'match' || !body.data) {
    throw new Error(body?.notice || body?.status || 'Postcode not found');
  }
  const { latitude, longitude, postcode: formatted } = body.data;
  const result: GeocodeResult = { lat: parseFloat(latitude), lng: parseFloat(longitude), label: formatted };
  geocodeCache.set(key, result);
  return result;
}

export async function fetchCrimes(lat: number, lng: number, date: string): Promise<RawCrime[]> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)},${date}`;
  const cached = crimesCache.get(key);
  if (cached) return cached;

  const url = new URL(`${CRIME_BASE}/crimes-street/all-crime`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lng', String(lng));
  if (date) url.searchParams.set('date', date);

  const res = await fetch(url);

  if (res.status === 404) {
    // The police API only has data for a rolling window (it typically lags
    // a couple of months behind, and only keeps a few years of history) and
    // returns 404 for a postcode/month combination it has nothing for -
    // that's not a failure, it just means zero crimes for that month, so it
    // shouldn't be surfaced as a search error.
    crimesCache.set(key, []);
    return [];
  }
  if (res.status === 503) {
    // Documented API behaviour: more than 10,000 crimes matched a single
    // request. Worth a clearer message than a bare "HTTP 503".
    throw new Error('too many crimes in this area for one request - try a smaller date range');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: RawCrime[] = await res.json();
  crimesCache.set(key, data);
  return data;
}
