'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getTheme, type ColorMode } from '@/lib/theme';

const STORAGE_KEY = 'crime-dashboard:color-mode';

interface ColorModeContextValue {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggleColorMode: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export default function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>('light');

  // Read the persisted preference (or fall back to the OS setting) once the
  // component mounts in the browser.
  useEffect(() => {
    // Deferred to a microtask so these setState calls don't run
    // synchronously within the effect body (avoids cascading renders).
    queueMicrotask(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setMode(stored);
          return;
        }
      } catch {
        // localStorage unavailable - fall through to the OS preference.
      }
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        setMode('dark');
      }
    });
  }, []);

  const toggleColorMode = () => {
    setMode((prev) => {
      const next: ColorMode = prev === 'light' ? 'dark' : 'light';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore - the toggle still works for this session, just won't persist.
      }
      return next;
    });
  };

  const theme = useMemo(() => getTheme(mode), [mode]);
  const contextValue = useMemo(() => ({ mode, toggleColorMode }), [mode]);

  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ColorModeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
