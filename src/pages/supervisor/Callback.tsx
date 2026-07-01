import { useState } from 'react';
import {
  Box, Table, TableHead, TableRow, TableCell, TableBody, Stack, Typography,
  CircularProgress, Alert, IconButton, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import EventBusyOutlined from '@mui/icons-material/EventBusyOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import { fetchCallbacks, cancelCallback, fetchCampaigns } from '../../services/api/client';

export function Callback() {
  const { data: callbacks, loading, error, reload } = useApiData(fetchCallbacks);
  const { data: campaigns } = useApiData(fetchCampaigns);
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const campaignList = campaigns ?? [];
  const list = callbacks ?? [];
  const filtered = campaignFilter === 'all' ? list : list.filter((cb) => cb.campaignId === campaignFilter);

  const handleCancel = async (callbackId: string) => {
    setCancellingId(callbackId);
    try {
      await cancelCallback(callbackId);
      reload();
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Callback" subtitle="All scheduled callbacks across agents and campaigns." />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Campaign</InputLabel>
          <Select label="Campaign" value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)}>
            <MenuItem value="all">All Campaigns</MenuItem>
            {campaignList.map((c) => (
              <MenuItem key={c.campaignId} value={c.campaignId}>{c.campaignName}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {!loading && (
          <Table size="small" sx={{ minWidth: 880 }}>
            <TableHead>
              <TableRow>
                <TableCell>Agent</TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Campaign</TableCell>
                <TableCell>Callback Time</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((cb) => {
                const campaign = campaignList.find((c) => c.campaignId === cb.campaignId);
                return (
                  <TableRow key={cb.callbackId} hover>
                    <TableCell>{cb.user}</TableCell>
                    <TableCell>{cb.firstName} {cb.lastName}</TableCell>
                    <TableCell>{cb.phoneNumber}</TableCell>
                    <TableCell>{campaign?.campaignName ?? cb.campaignId}</TableCell>
                    <TableCell>{cb.callbackTime}</TableCell>
                    <TableCell>{cb.recipient === 'USERONLY' ? 'Only agent' : 'Any agent'}</TableCell>
                    <TableCell>{cb.comments || '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        disabled={cancellingId === cb.callbackId}
                        onClick={() => { void handleCancel(cb.callbackId); }}
                      >
                        <EventBusyOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No scheduled callbacks.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Showing {filtered.length} of {list.length} scheduled callbacks
      </Typography>
    </Box>
  );
}
