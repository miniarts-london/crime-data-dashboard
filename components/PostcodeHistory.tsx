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
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" color="primary">
          Searched postcodes
        </Typography>
        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Postcodes you search will appear here.
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {entries.map((entry) => (
              <Chip
                key={entry.postcode}
                label={entry.postcode}
                size="small"
                variant="outlined"
                onClick={() => onSelect(entry.postcode)}
                onDelete={() => onRemove(entry.postcode)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
