import dayjs from 'dayjs';
import { categoryLabel } from '@/lib/theme';
import type { CrimeRecord } from '@/lib/types';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function crimePopupHtml(crime: CrimeRecord): string {
  return `<div class="crime-popup">
      <strong>${escapeHtml(categoryLabel(crime.category))}</strong>
      <div class="crime-popup-meta">
        Postcode: ${escapeHtml(crime.postcode)}<br />
        Street: ${escapeHtml(crime.street)}<br />
        Month: ${escapeHtml(dayjs(`${crime.month}-01`).format('MMM YYYY'))}<br />
        Outcome: ${escapeHtml(crime.outcome)}
      </div>
    </div>`;
}
