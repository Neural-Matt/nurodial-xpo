import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Stack, Select, MenuItem,
  FormControl, InputLabel, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Alert, IconButton, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import EventBusyOutlined from '@mui/icons-material/EventBusyOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import {
  fetchCampaigns, fetchLeads, fetchCallbacks, createCallback, cancelCallback,
} from '../../services/api/client';
import { useAuth } from '../../context/useAuth';

export function Callback() {
  const { user } = useAuth();
  const { data: campaigns } = useApiData(fetchCampaigns);
  const { data: callbacks, loading, error, reload } = useApiData(fetchCallbacks);

  const [campaignId, setCampaignId] = useState('');
  const { data: leads } = useApiData(() => fetchLeads(campaignId || undefined));
  const [leadId, setLeadId] = useState('');
  const [callbackTime, setCallbackTime] = useState<Dayjs | null>(null);
  const [comments, setComments] = useState('');
  const [recipient, setRecipient] = useState<'USERONLY' | 'ANYONE'>('USERONLY');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const campaignList = campaigns ?? [];
  const leadList = leads ?? [];
  const myCallbacks = callbacks ?? [];

  const selectedLead = leadList.find((l) => l.leadId === leadId);

  const canSchedule = Boolean(campaignId) && Boolean(leadId) && callbackTime !== null && !saving;

  const resetForm = () => {
    setLeadId('');
    setCallbackTime(null);
    setComments('');
    setRecipient('USERONLY');
  };

  const handleSchedule = async () => {
    if (!selectedLead || !callbackTime) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createCallback({
        leadId: selectedLead.leadId,
        listId: selectedLead.listId,
        campaignId,
        callbackTime: callbackTime.format('YYYY-MM-DD HH:mm:ss'),
        comments,
        recipient,
      });
      resetForm();
      reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to schedule callback.');
    } finally {
      setSaving(false);
    }
  };

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
      <PageHeader title="Callback" subtitle="Schedule and manage your callbacks with leads." />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Schedule a Callback</Typography>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Campaign</InputLabel>
                <Select
                  label="Campaign"
                  value={campaignId}
                  onChange={(e) => { setCampaignId(e.target.value); setLeadId(''); }}
                >
                  {campaignList.map((c) => (
                    <MenuItem key={c.campaignId} value={c.campaignId}>{c.campaignName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 220 }} disabled={!campaignId}>
                <InputLabel>Lead</InputLabel>
                <Select label="Lead" value={leadId} onChange={(e) => setLeadId(e.target.value)}>
                  {leadList.map((l) => (
                    <MenuItem key={l.leadId} value={l.leadId}>
                      {l.firstName} {l.lastName} — {l.phoneNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DateTimePicker
                label="Callback time"
                value={callbackTime}
                onChange={(value) => setCallbackTime(value)}
                minDateTime={dayjs()}
                slotProps={{ textField: { size: 'small' } }}
              />
              <TextField
                size="small"
                placeholder="Notes for this callback..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                sx={{ flex: 1, minWidth: 220 }}
              />
              <RadioGroup
                row
                value={recipient}
                onChange={(e) => setRecipient(e.target.value as 'USERONLY' | 'ANYONE')}
              >
                <FormControlLabel value="USERONLY" control={<Radio size="small" />} label="Only me" />
                <FormControlLabel value="ANYONE" control={<Radio size="small" />} label="Any agent" />
              </RadioGroup>
              <Button
                variant="contained"
                disabled={!canSchedule}
                onClick={() => { void handleSchedule(); }}
              >
                {saving ? 'Scheduling…' : 'Schedule'}
              </Button>
            </Stack>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {!loading && (
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Lead</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Callback Time</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myCallbacks.map((cb) => (
                <TableRow key={cb.callbackId} hover>
                  <TableCell>{cb.firstName} {cb.lastName}</TableCell>
                  <TableCell>{cb.phoneNumber}</TableCell>
                  <TableCell>{cb.callbackTime}</TableCell>
                  <TableCell>{cb.recipient === 'USERONLY' ? 'Only me' : 'Any agent'}</TableCell>
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
              ))}
              {myCallbacks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No scheduled callbacks{user ? ` for ${user.displayName}` : ''}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
