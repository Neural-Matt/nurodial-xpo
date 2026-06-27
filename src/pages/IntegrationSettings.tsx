import React, { useState } from 'react';
import { Box, Typography, TextField, Switch, FormControlLabel, Button, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export const IntegrationSettings: React.FC = () => {
  const [mockMode, setMockMode] = useState(true);
  const [serverUrl, setServerUrl] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>VICIDial Integration Settings</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="VICIDial Connection" />
        <Tab label="Backend Proxy" />
        <Tab label="API Credentials" />
        <Tab label="Sync Rules" />
        <Tab label="Webhooks" />
        <Tab label="Logs" />
        <Tab label="Security" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <TextField label="VICIDial Server URL" fullWidth value={serverUrl} onChange={e => setServerUrl(e.target.value)} sx={{ mb: 2 }} />
          <FormControlLabel control={<Switch checked={mockMode} onChange={e => setMockMode(e.target.checked)} />} label="Mock Mode" />
          <Button variant="contained" sx={{ mt: 2 }}>Test Connection</Button>
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <TextField label="Backend Proxy URL" fullWidth value={proxyUrl} onChange={e => setProxyUrl(e.target.value)} sx={{ mb: 2 }} />
        </Box>
      )}
      {tab === 5 && (
        <Box>
          <Typography variant="h6" gutterBottom>API Logs</Typography>
          <Table size="small"><TableHead><TableRow><TableCell>Timestamp</TableCell><TableCell>Endpoint</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{/* TODO */}</TableBody></Table>
          <Typography variant="h6" sx={{ mt: 2 }}>Error Logs</Typography>
          <Table size="small"><TableHead><TableRow><TableCell>Timestamp</TableCell><TableCell>Error</TableCell></TableRow></TableHead><TableBody>{/* TODO */}</TableBody></Table>
        </Box>
      )}
      {tab === 6 && (
        <Box><Typography>Never store VICIDial credentials in the browser. All calls will be proxied through a secure backend.</Typography></Box>
      )}
    </Box>
  );
};
