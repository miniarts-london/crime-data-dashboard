'use client';

import { Box, Stack, Typography, Grid, AppBar, Paper, Toolbar } from "@mui/material";
import SearchBar from "./SearchBar";
import { FormEvent, useState } from "react";
import { parseSearchParams } from "./Helper";
import { parsePostcodesInput } from "@/lib/postcodes";
import { currentMonth } from "@/lib/dateRange";

export interface InitialParams {
  postcodes: string[];
  from: string;
  to: string;
}

export default function Dashboard() {

  const [initialParams] = useState<InitialParams>(() => parseSearchParams());
  const [postcodes, setPostcodes] = useState<string[]>(initialParams.postcodes);
  const [from, setFrom] = useState(initialParams.from);
  const [to, setTo] = useState(initialParams.to);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const runSearch = (postcodes: string[], from: string, to: string) => {console.log('Running search with:', postcodes, from, to);}

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { valid, invalid } = parsePostcodesInput(postcodes.join(','));
    if (valid.length === 0) {
      setNotice('Enter at least one valid UK postcode to search.');
      return;
    }
    setNotice(invalid.length ? `Ignored invalid postcode(s): ${invalid.join(', ')}` : '');
    // Reflect the validated, deduped, normalized set back into the chips.
    setPostcodes(valid);
    const useFrom = from || currentMonth();
    const useTo = to || currentMonth();
    setFrom(useFrom);
    setTo(useTo);
    runSearch(valid, useFrom, useTo);
  };

  const handleReset = () => {
   console.log('Resetting search');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, py: 1.5 }}>
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
          </Stack>
          <SearchBar
            postcodes={postcodes}
            onPostcodesChange={setPostcodes}
            from={from}
            onFromChange={setFrom}
            to={to}
            onToChange={setTo}
            onSubmit={handleSearchSubmit}
            onReset={handleReset}
            loading={loading}
            notice={notice}
          />
        </Toolbar>
        
       
        
      </AppBar>
      <Grid container sx={{p:2, pb:0}}>
        <Grid size={{xs:12, sm:12, md:2}} sx={{p:1}}>
          {/* postcode search history */}
        </Grid>
        <Grid size={{xs:12, sm:12, md:'grow'}} sx={{ p:1 }}>
          {/* overview */}
        </Grid>
      </Grid> 
      <Grid container sx={{p:2}}>
        <Grid size={{xs:12, sm:12, lg:6}} sx={{p:1}}>
          <Paper variant="outlined">
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="overline" color="primary">
                Crime Map
              </Typography>
             </Box>
          </Paper>
        </Grid>
        <Grid size={{xs:12, sm:12, lg:6}} sx={{p:1}}>
          <Paper variant="outlined">
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="overline" color="primary">
                Crime Table
                </Typography>
              <Typography variant="body2" color="text.secondary">
                Click a postcode, crime type, or outcome status to filter the results
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
