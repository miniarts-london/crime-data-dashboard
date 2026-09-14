import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface HeaderProps {
    mode: 'light' | 'dark';
    toggleColorMode: () => void;
}

export default function Header ({mode, toggleColorMode}: HeaderProps) {
    return(
        <Stack direction="row" sx={{ width: '100%', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="overline" color="primary">
                UK Police data
              </Typography>
              <Typography variant="h4">
                Crime Data Dashboard
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 800, mb: 2 }}>
                Enter one or more postcodes to view totals, a map, and a filterable table. Police.uk
                street-level data is usually published about two months behind.
              </Typography>
            </Box>
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton
                onClick={toggleColorMode}
                size="small"
                aria-label="Toggle color mode"
                sx={{ ml: 'auto', flexShrink: 0 }}
              >
                {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Tooltip>
          </Stack>
    )
}