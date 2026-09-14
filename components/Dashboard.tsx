'use client';

import { Box, Stack, Typography, Grid, AppBar, Paper, Toolbar } from "@mui/material";

export default function Dashboard() {

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
      {/* serchbar */}
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
