'use client';

import { type ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function Providers({ children }: { children: ReactNode }) {

  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
    </AppRouterCacheProvider>
  );
}
