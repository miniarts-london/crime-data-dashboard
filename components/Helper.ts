import { currentMonth } from "@/lib/dateRange";
import { parsePostcodesInput } from "@/lib/postcodes";
import { InitialParams } from "@/types/dashboard";

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

