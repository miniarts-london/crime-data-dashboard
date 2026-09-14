import { createTheme, type Theme } from '@mui/material/styles';

export type ColorMode = 'light' | 'dark';

// Fixed categorical color map: every crime category slug always resolves to
// the same color (per theme mode), independent of which categories are
// present in a given search - identity follows the entity, never its rank in
// the current view. Light/dark hex pairs are separately validated steps of
// the same eight hues, not an automatic light->dark flip.
export const CATEGORY_COLORS: Record<string, { light: string; dark: string; label: string }> = {
  'violence-and-sexual-offences': { light: '#2a78d6', dark: '#3987e5', label: 'Violence & sexual offences' },
  'violent-crime':                { light: '#2a78d6', dark: '#3987e5', label: 'Violent crime' }, // legacy slug
  'anti-social-behaviour':        { light: '#eb6834', dark: '#d95926', label: 'Anti-social behaviour' },
  'vehicle-crime':                { light: '#1baf7a', dark: '#199e70', label: 'Vehicle crime' },
  'criminal-damage-arson':        { light: '#eda100', dark: '#c98500', label: 'Criminal damage & arson' },
  'burglary':                     { light: '#e87ba4', dark: '#d55181', label: 'Burglary' },
  'public-order':                 { light: '#008300', dark: '#008300', label: 'Public order' },
  'drugs':                        { light: '#4a3aa7', dark: '#9085e9', label: 'Drugs' },
  'other-theft':                  { light: '#e34948', dark: '#e66767', label: 'Other theft' },
};

export const OTHER_COLOR: Record<ColorMode, string> = { light: '#898781', dark: '#898781' };
export const OTHER_LABEL = 'Other (bicycle theft, robbery, shoplifting, weapons, etc.)';
export const CATEGORY_ORDER: string[] = [
  ...Object.keys(CATEGORY_COLORS).filter((k) => k !== 'violent-crime'),
  'other',
];

export function prettify(slug: string | undefined | null): string {
  return (slug || 'unknown').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
export function bucketFor(category: string): string {
  return CATEGORY_COLORS[category] ? category : 'other';
}
export function colorFor(bucket: string, mode: ColorMode = 'light'): string {
  if (bucket === 'other') return OTHER_COLOR[mode];
  return CATEGORY_COLORS[bucket]?.[mode] || OTHER_COLOR[mode];
}
export function labelFor(bucket: string): string {
  if (bucket === 'other') return OTHER_LABEL;
  return CATEGORY_COLORS[bucket]?.label || prettify(bucket);
}
// Always the specific category label (never the generic "Other" bucket text) -
// used in per-marker/per-row detail views, as opposed to labelFor() which is
// used for the bucketed legend/chips.
export function categoryLabel(category: string): string {
  return CATEGORY_COLORS[category]?.label || prettify(category);
}

export function getTheme(mode: ColorMode): Theme {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#800020' : '#d46a78' },
      secondary: { main: mode === 'light' ? '#000080' : '#8aa4d6' },
      background:
        mode === 'light'
          ? { default: '#f9f9f7', paper: '#fcfcfb' }
          : { default: '#0d0d0d', paper: '#1a1a19' },
      text:
        mode === 'light'
          ? { primary: '#0b0b0b', secondary: '#52514e' }
          : { primary: '#ffffff', secondary: '#c3c2b7' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      h4: {
        fontFamily: 'var(--font-display), Georgia, "Times New Roman", serif',
        fontWeight: 600,
        letterSpacing: '-0.02em',
        lineHeight: 1.15,
      },
    },
  });
}
