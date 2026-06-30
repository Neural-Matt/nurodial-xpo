import { useState } from 'react';
import { Box, Typography, TextField, Switch, FormControlLabel, Button, Tabs, Tab, Grid, MenuItem } from '@mui/material';
import { PageHeader } from '../../components/common/PageHeader';

export function GlobalSettings() {
  const [tab, setTab] = useState(0);
  const [mockMode, setMockMode] = useState(true);
  const [serverUrl, setServerUrl] = useState('');

  return (
    <Box>
      <PageHeader title="Global Settings" subtitle="System-wide configuration, default dialer settings, and general application preferences." />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Dialer Defaults" />
        <Tab label="General Preferences" />
        <Tab label="VICIDial Integration" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2} sx={{ maxWidth: 480 }}>
          <Grid size={12}>
            <TextField select label="Default Dial Method" fullWidth defaultValue="RATIO" size="small">
              <MenuItem value="RATIO">Ratio</MenuItem>
              <MenuItem value="ADAPT_HARD_LIMIT">Adaptive (Hard Limit)</MenuItem>
              <MenuItem value="MANUAL">Manual</MenuItem>
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField label="Default Dial Level" type="number" fullWidth defaultValue={2} size="small" />
          </Grid>
          <Grid size={12}>
            <TextField label="Default Dial Timeout (seconds)" type="number" fullWidth defaultValue={45} size="small" />
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={2} sx={{ maxWidth: 480 }}>
          <Grid size={12}>
            <TextField select label="Time Zone" fullWidth defaultValue="America/New_York" size="small">
              <MenuItem value="America/New_York">Eastern Time (US)</MenuItem>
              <MenuItem value="America/Chicago">Central Time (US)</MenuItem>
              <MenuItem value="America/Denver">Mountain Time (US)</MenuItem>
              <MenuItem value="America/Los_Angeles">Pacific Time (US)</MenuItem>
            </TextField>
          </Grid>
          <Grid size={12}>
            <FormControlLabel control={<Switch defaultChecked />} label="Enable email notifications" />
          </Grid>
          <Grid size={12}>
            <FormControlLabel control={<Switch defaultChecked />} label="Enable desktop notifications" />
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={2} sx={{ maxWidth: 480 }}>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Connect this console to a VICIDial server. Credentials are never stored in the browser — calls are proxied through a secure backend.
            </Typography>
          </Grid>
          <Grid size={12}>
            <TextField label="VICIDial Server URL" fullWidth size="small" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} />
          </Grid>
          <Grid size={12}>
            <FormControlLabel control={<Switch checked={mockMode} onChange={(e) => setMockMode(e.target.checked)} />} label="Mock Mode" />
          </Grid>
          <Grid size={12}>
            <Button variant="contained">Test Connection</Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
