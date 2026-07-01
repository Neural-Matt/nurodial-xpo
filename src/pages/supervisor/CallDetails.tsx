import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Box, Card, CardContent, Stack, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Typography, CircularProgress, Alert, IconButton,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import NavigateBeforeOutlined from '@mui/icons-material/NavigateBeforeOutlined';
import NavigateNextOutlined from '@mui/icons-material/NavigateNextOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApiData } from '../../hooks/useApiData';
import {
  fetchCallLog, fetchAllCallLog, fetchCampaigns, fetchUsers, fetchDispositions,
} from '../../services/api/client';
import { downloadCsv } from '../../utils/csv';

const PAGE_SIZE = 25;

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function CallDetails() {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [campaignId, setCampaignId] = useState('');
  const [agentUser, setAgentUser] = useState('');
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: campaigns } = useApiData(fetchCampaigns);
  const { data: users } = useApiData(fetchUsers);
  const { data: dispositions } = useApiData(fetchDispositions);
  const { data, loading, error, reload } = useApiData(
    () => fetchCallLog({
      startDate, endDate, limit: PAGE_SIZE, offset,
      campaignId: campaignId || undefined,
      user: agentUser || undefined,
      status: status || undefined,
    }),
  );

  const calls = data?.calls ?? [];
  const total = data?.total ?? 0;
  const campaignList = campaigns ?? [];
  const userList = users ?? [];
  const dispositionList = dispositions ?? [];

  const handleApply = () => { setOffset(0); reload(); };
  const handlePrev = () => { setOffset((o) => Math.max(0, o - PAGE_SIZE)); reload(); };
  const handleNext = () => { setOffset((o) => o + PAGE_SIZE); reload(); };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const rows = await fetchAllCallLog({
        startDate, endDate,
        campaignId: campaignId || undefined,
        user: agentUser || undefined,
        status: status || undefined,
      });
      downloadCsv(
        `call-details_${startDate}_${endDate}.csv`,
        ['Date/Time', 'Agent', 'Lead', 'Phone', 'Campaign', 'Duration (sec)', 'Disposition'],
        rows.map((c) => [
          c.callDate, c.userFullName, `${c.leadFirstName} ${c.leadLastName}`.trim(),
          c.phoneNumber, c.campaignId, c.durationSec, c.statusName,
        ]),
      );
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Call Details"
        subtitle="Historical call log across all agents and campaigns."
        actions={
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlined />}
            disabled={exporting}
            onClick={() => { void handleExport(); }}
          >
            {exporting ? 'Exporting…' : 'Download CSV'}
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Campaign</InputLabel>
              <Select label="Campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
                <MenuItem value="">All Campaigns</MenuItem>
                {campaignList.map((c) => (
                  <MenuItem key={c.campaignId} value={c.campaignId}>{c.campaignName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Agent</InputLabel>
              <Select label="Agent" value={agentUser} onChange={(e) => setAgentUser(e.target.value)}>
                <MenuItem value="">All Agents</MenuItem>
                {userList.map((u) => (
                  <MenuItem key={u.username} value={u.username}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Disposition</InputLabel>
              <Select label="Disposition" value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">All Dispositions</MenuItem>
                {dispositionList.map((d) => (
                  <MenuItem key={d.statusCode} value={d.statusCode}>{d.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleApply}>Apply</Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {exportError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setExportError(null)}>{exportError}</Alert>}

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {!loading && (
          <Table size="small" sx={{ minWidth: 900, '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Date/Time</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Campaign</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Disposition</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.uniqueId} hover>
                  <TableCell>{call.callDate}</TableCell>
                  <TableCell>{call.userFullName}</TableCell>
                  <TableCell>{call.leadFirstName} {call.leadLastName}</TableCell>
                  <TableCell>{call.phoneNumber}</TableCell>
                  <TableCell>{call.campaignId}</TableCell>
                  <TableCell>{formatDuration(call.durationSec)}</TableCell>
                  <TableCell><StatusBadge label={call.statusName} /></TableCell>
                </TableRow>
              ))}
              {calls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No calls found for these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {calls.length ? offset + 1 : 0}-{offset + calls.length} of {total}
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" disabled={offset === 0} onClick={handlePrev}><NavigateBeforeOutlined /></IconButton>
            <IconButton size="small" disabled={offset + PAGE_SIZE >= total} onClick={handleNext}><NavigateNextOutlined /></IconButton>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
