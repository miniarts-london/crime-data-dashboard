import { currentMonth } from "@/lib/dateRange";
import { parsePostcodesInput } from "@/lib/postcodes";

export interface InitialParams {
  postcodes: string[];
  from: string;
  to: string;
}

export function parseSearchParams(): InitialParams {
  const params = new URLSearchParams(window.location.search);
  const { valid } = parsePostcodesInput(params.get('postcodes') || '');
  const today = currentMonth();
  return {
    postcodes: valid,
    from: params.get('from') || today,
    to: params.get('to') || today,
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

