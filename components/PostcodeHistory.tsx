'use client';

import { Box, Chip, Stack, Typography, Paper } from '@mui/material';
import type { HistoryEntry } from '@/lib/usePostcodeHistory';

interface PostcodeHistoryProps {
  entries: HistoryEntry[];
  onSelect: (postcode: string) => void;
  onRemove: (postcode: string) => void;
}

export default function PostcodeHistory({ entries, onSelect, onRemove }: PostcodeHistoryProps) {
  return (
    <Paper variant="outlined" sx={{ height: '100%' }}>
      <Box sx={{ p: 2, textAlign: 'left' }}>
        <Typography variant="overline" color="primary" component="p" sx={{ m: 0 }}>
          Searched postcodes
        </Typography>
        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Postcodes you search will appear here.
          </Typography>
        ) : (
          <Stack
            component="ul"
            direction={{ xs: 'row', md: 'column' }}
            alignItems="flex-start"
            sx={{
              m: 0,
              mt: 1,
              p: 0,
              listStyle: 'none',
              gap: 1,
              alignItems: 'flex-start',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              width: { xs: '100%', md: 'fit-content' },
            }}
          >
            {entries.map((entry) => (
              <Box component="li" key={entry.postcode} sx={{ width: 'auto', maxWidth: '100%' }}>
                <Chip
                  label={entry.postcode}
                  size="small"
                  variant="outlined"
                  onClick={() => onSelect(entry.postcode)}
                  onDelete={() => onRemove(entry.postcode)}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
