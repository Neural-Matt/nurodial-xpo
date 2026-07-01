import { useRef, useState } from 'react';
import {
  Box, Grid, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableHead, TableRow, TableCell, TableBody, Stack, Typography,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import FiberNewOutlined from '@mui/icons-material/FiberNewOutlined';
import EventRepeatOutlined from '@mui/icons-material/EventRepeatOutlined';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  fetchLeads, fetchCampaigns, fetchLists, importLeads,
  type ImportLeadRow, type ImportLeadsResult,
} from '../../services/api/client';
import { useApiData } from '../../hooks/useApiData';
import { parseCsv } from '../../utils/csv';

// Accepted CSV header names (case-insensitive), mapped to ImportLeadRow keys.
const COLUMN_ALIASES: Record<string, keyof ImportLeadRow> = {
  phonenumber: 'phoneNumber', phone: 'phoneNumber',
  firstname: 'firstName', lastname: 'lastName', email: 'email',
  city: 'city', province: 'province', state: 'province',
  address: 'address', vendorleadcode: 'vendorLeadCode', sourceid: 'sourceId',
};

function parseLeadCsv(text: string): ImportLeadRow[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => COLUMN_ALIASES[h.trim().toLowerCase()]);
  return rows.slice(1).map((row) => {
    const lead: ImportLeadRow = { phoneNumber: '' };
    row.forEach((cell, i) => {
      const key = headers[i];
      if (key) (lead as unknown as Record<string, string>)[key] = cell.trim();
    });
    return lead;
  }).filter((lead) => lead.phoneNumber);
}

const STATUS_TONE: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  NEW: 'info',
  CALLBK: 'warning',
  SALE: 'success',
  NI: 'neutral',
  DNC: 'error',
  AM: 'neutral',
  NA: 'neutral',
};

export function LeadLists() {
  const { data: leads, loading: leadsLoading, error: leadsError, reload: reloadLeads } = useApiData(fetchLeads);
  const { data: campaigns, loading: campaignsLoading } = useApiData(fetchCampaigns);
  const { data: lists } = useApiData(fetchLists);
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [importOpen, setImportOpen] = useState(false);
  const [importListId, setImportListId] = useState('');
  const [importRows, setImportRows] = useState<ImportLeadRow[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportLeadsResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = leadsLoading || campaignsLoading;
  const list = leads ?? [];
  const campaignList = campaigns ?? [];
  const listOptions = lists ?? [];

  const handleFileSelect = async (file: File) => {
    setImportError(null);
    setImportResult(null);
    setImportFileName(file.name);
    const text = await file.text();
    const rows = parseLeadCsv(text);
    if (!rows.length) {
      setImportError('No valid rows found. The CSV needs at least a "phoneNumber" column.');
    }
    setImportRows(rows);
  };

  const handleImport = async () => {
    if (!importListId || !importRows.length) return;
    setImporting(true);
    setImportError(null);
    try {
      const result = await importLeads(importListId, importRows);
      setImportResult(result);
      reloadLeads();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import leads.');
    } finally {
      setImporting(false);
    }
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportListId('');
    setImportRows([]);
    setImportFileName('');
    setImportError(null);
    setImportResult(null);
  };

  const newCount = list.filter((l) => l.status === 'NEW').length;
  const callbackCount = list.filter((l) => l.status === 'CALLBK').length;
  const dncCount = list.filter((l) => l.status === 'DNC').length;

  const filtered = list.filter((lead) => {
    const term = search.trim().toLowerCase();
    const matchesTerm = !term
      || `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(term)
      || lead.phoneNumber.includes(term);
    const matchesCampaign = campaignFilter === 'all' || lead.campaignId === campaignFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesTerm && matchesCampaign && matchesStatus;
  });

  const uniqueStatuses = [...new Set(list.map((l) => l.status))].sort();

  return (
    <Box>
      <PageHeader
        title="Leads Management"
        subtitle="View and filter leads loaded into VICIdial campaigns."
        actions={
          <>
            <Button variant="outlined" startIcon={<UploadFileOutlined />} onClick={() => setImportOpen(true)}>Import Leads</Button>
            <Button variant="contained" startIcon={<AddOutlined />}>Add Lead</Button>
          </>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Total Leads" value={list.length.toLocaleString()} icon={ListAltOutlined} variant="neutral" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="New" value={newCount} icon={FiberNewOutlined} variant="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Callbacks Due" value={callbackCount} icon={EventRepeatOutlined} variant="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Do Not Call" value={dncCount} icon={BlockOutlined} variant="error" />
        </Grid>
      </Grid>

      {leadsError && <Alert severity="error" sx={{ mb: 2 }}>{leadsError}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by name or phone..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280, flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Campaign</InputLabel>
          <Select label="Campaign" value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)}>
            <MenuItem value="all">All Campaigns</MenuItem>
            {campaignList.map((c) => (
              <MenuItem key={c.campaignId} value={c.campaignId}>{c.campaignName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All Status</MenuItem>
            {uniqueStatuses.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {!loading && (
          <Table size="small" sx={{ minWidth: 880, '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Campaign</TableCell>
                <TableCell>List ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Called</TableCell>
                <TableCell>Last Call</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((lead) => {
                const campaign = campaignList.find((c) => c.campaignId === lead.campaignId);
                return (
                  <TableRow key={lead.leadId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {lead.firstName} {lead.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{lead.email || '—'}</Typography>
                    </TableCell>
                    <TableCell>{lead.phoneNumber}</TableCell>
                    <TableCell>{campaign?.campaignName ?? lead.campaignId ?? '—'}</TableCell>
                    <TableCell>{lead.listId}</TableCell>
                    <TableCell>
                      <StatusBadge label={lead.status} tone={STATUS_TONE[lead.status] ?? 'neutral'} />
                    </TableCell>
                    <TableCell>{lead.calledCount}</TableCell>
                    <TableCell>{lead.lastCallTime || '—'}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Showing {filtered.length} of {list.length.toLocaleString()} leads
      </Typography>

      <Dialog open={importOpen} onClose={closeImport} maxWidth="sm" fullWidth>
        <DialogTitle>Import Leads</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              CSV needs a <code>phoneNumber</code> column (any Zambian format — with or without +260, with or
              without a leading 0 — is auto-detected and normalized). Optional columns: firstName, lastName,
              email, city, province, address, vendorLeadCode, sourceId.
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>List</InputLabel>
              <Select label="List" value={importListId} onChange={(e) => setImportListId(e.target.value)}>
                {listOptions.map((l) => (
                  <MenuItem key={l.listId} value={l.listId}>
                    {l.listName} (#{l.listId}) — {l.leadCount} leads
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFileSelect(f); }}
            />
            <Button variant="outlined" startIcon={<UploadFileOutlined />} onClick={() => fileInputRef.current?.click()}>
              {importFileName || 'Choose CSV file...'}
            </Button>
            {importRows.length > 0 && !importResult && (
              <Alert severity="info">{importRows.length} row(s) ready to import.</Alert>
            )}
            {importError && <Alert severity="error">{importError}</Alert>}
            {importResult && (
              <Alert severity={importResult.failed.length ? 'warning' : 'success'}>
                Imported {importResult.imported} lead(s).
                {importResult.failed.length > 0 && (
                  <Box component="span" sx={{ display: 'block', mt: 1 }}>
                    {importResult.failed.length} row(s) skipped:
                    <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
                      {importResult.failed.slice(0, 10).map((f) => (
                        <li key={f.row}>Row {f.row} ("{f.phoneNumber}"): {f.reason}</li>
                      ))}
                    </Box>
                    {importResult.failed.length > 10 && <Typography variant="caption">…and {importResult.failed.length - 10} more.</Typography>}
                  </Box>
                )}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImport}>{importResult ? 'Close' : 'Cancel'}</Button>
          {!importResult && (
            <Button
              variant="contained"
              disabled={!importListId || !importRows.length || importing}
              onClick={() => { void handleImport(); }}
            >
              {importing ? 'Importing…' : `Import ${importRows.length || ''} Lead(s)`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
