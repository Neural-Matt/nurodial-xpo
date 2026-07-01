import { useState } from 'react';
import {
  Box, Tabs, Tab, Card, CardContent, Stack, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Typography, CircularProgress, Alert, IconButton,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import {
  fetchDncList, addToDnc, removeFromDnc, fetchCampaignDnc, addToCampaignDnc, removeFromCampaignDnc,
  fetchCampaigns,
} from '../../services/api/client';

const PHONE_PATTERN = /^[0-9]{7,18}$/;

function GlobalDncPanel() {
  const [search, setSearch] = useState('');
  const { data, loading, error, reload } = useApiData(() => fetchDncList(search || undefined));
  const [newNumber, setNewNumber] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingNumber, setRemovingNumber] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const numbers = data ?? [];
  const canAdd = PHONE_PATTERN.test(newNumber.trim());

  const handleAdd = async () => {
    setAdding(true);
    setActionError(null);
    try {
      await addToDnc(newNumber.trim());
      setNewNumber('');
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add number.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (phoneNumber: string) => {
    setRemovingNumber(phoneNumber);
    setActionError(null);
    try {
      await removeFromDnc(phoneNumber);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove number.');
    } finally {
      setRemovingNumber(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Numbers on this list are blocked from being dialed across every campaign.
      </Typography>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
        <TextField
          label="Phone Number"
          size="small"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 8135551234"
          sx={{ width: 200 }}
        />
        <Button variant="contained" disabled={!canAdd || adding} onClick={() => { void handleAdd(); }}>
          {adding ? 'Adding…' : 'Add to DNC'}
        </Button>
      </Stack>

      <TextField
        placeholder="Search numbers..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ maxWidth: 280 }}
      />

      {error && <Alert severity="error">{error}</Alert>}
      {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>}
        {!loading && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Phone Number</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {numbers.map((n) => (
                <TableRow key={n} hover>
                  <TableCell>{n}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" disabled={removingNumber === n} onClick={() => { void handleRemove(n); }}>
                      <DeleteOutlineOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {numbers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No numbers on the global DNC list.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>
    </Stack>
  );
}

function CampaignDncPanel() {
  const { data: campaigns } = useApiData(fetchCampaigns);
  const [campaignId, setCampaignId] = useState('');
  const { data, loading, error, reload } = useApiData(
    () => (campaignId ? fetchCampaignDnc(campaignId) : Promise.resolve([] as string[])),
  );
  const [newNumber, setNewNumber] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingNumber, setRemovingNumber] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const campaignList = campaigns ?? [];
  const numbers = data ?? [];
  const canAdd = Boolean(campaignId) && PHONE_PATTERN.test(newNumber.trim());

  const handleAdd = async () => {
    setAdding(true);
    setActionError(null);
    try {
      await addToCampaignDnc(campaignId, newNumber.trim());
      setNewNumber('');
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add number.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (phoneNumber: string) => {
    setRemovingNumber(phoneNumber);
    setActionError(null);
    try {
      await removeFromCampaignDnc(campaignId, phoneNumber);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove number.');
    } finally {
      setRemovingNumber(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Numbers here are only blocked within the selected campaign.
      </Typography>

      <FormControl size="small" sx={{ maxWidth: 280 }}>
        <InputLabel>Campaign</InputLabel>
        <Select label="Campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
          {campaignList.map((c) => (
            <MenuItem key={c.campaignId} value={c.campaignId}>{c.campaignName}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {campaignId && (
        <>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <TextField
              label="Phone Number"
              size="small"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 8135551234"
              sx={{ width: 200 }}
            />
            <Button variant="contained" disabled={!canAdd || adding} onClick={() => { void handleAdd(); }}>
              {adding ? 'Adding…' : 'Add to Campaign DNC'}
            </Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {actionError && <Alert severity="error" onClose={() => setActionError(null)}>{actionError}</Alert>}

          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box>}
            {!loading && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Phone Number</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {numbers.map((n) => (
                    <TableRow key={n} hover>
                      <TableCell>{n}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" disabled={removingNumber === n} onClick={() => { void handleRemove(n); }}>
                          <DeleteOutlineOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {numbers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No numbers on this campaign's DNC list.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}

export function DoNotCall() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <PageHeader
        title="DNC / Blacklist"
        subtitle="Manage phone numbers blocked from being dialed."
      />
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Tab label="Global DNC" />
          <Tab label="Campaign DNC" />
        </Tabs>
        <CardContent>
          {tab === 0 ? <GlobalDncPanel /> : <CampaignDncPanel />}
        </CardContent>
      </Card>
    </Box>
  );
}
