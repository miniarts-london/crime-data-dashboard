// Loose UK postcode format validator (structure only, not existence - actual
// existence is confirmed by the getthedata.com geocoding call).
export const POSTCODE_REGEX = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;

export function normalizePostcode(pc: string): string {
  return pc.trim().toUpperCase().replace(/\s+/g, ' ');
}

// Splits a comma-separated postcode list into valid/invalid, deduping valid entries.
export function parsePostcodesInput(raw: string): { valid: string[]; invalid: string[] } {
  const parts = (raw || '').split(',').map((p) => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const p of parts) {
    const norm = normalizePostcode(p);
    if (!POSTCODE_REGEX.test(norm)) {
      invalid.push(p);
      continue;
    }
    if (seen.has(norm)) continue;
    seen.add(norm);
    valid.push(norm);
  }
  return { valid, invalid };
}
