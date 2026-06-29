import { useState } from 'react';
import {
  Box, Grid, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableHead, TableRow, TableCell, TableBody, Stack, Typography,
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
import { leads, leadsTotalCount } from '../../services/mock/leads';
import { campaigns } from '../../services/mock/campaigns';

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
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const newCount = leads.filter((l) => l.status === 'NEW').length;
  const callbackCount = leads.filter((l) => l.status === 'CALLBK').length;
  const dncCount = leads.filter((l) => l.status === 'DNC').length;

  const filtered = leads.filter((lead) => {
    const term = search.trim().toLowerCase();
    const matchesTerm = !term
      || `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(term)
      || lead.phoneNumber.includes(term);
    const matchesCampaign = campaignFilter === 'all' || lead.campaignId === campaignFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesTerm && matchesCampaign && matchesStatus;
  });

  return (
    <Box>
      <PageHeader
        title="Lead Lists"
        subtitle="Browse and manage leads loaded into VICIDial campaigns."
        actions={
          <>
            <Button variant="outlined" startIcon={<UploadFileOutlined />}>Import Leads</Button>
            <Button variant="contained" startIcon={<AddOutlined />}>Add Lead</Button>
          </>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Total Leads" value={leadsTotalCount.toLocaleString()} icon={ListAltOutlined} variant="neutral" />
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

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search leads by name or phone..."
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 280, flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Campaign</InputLabel>
          <Select label="Campaign" value={campaignFilter} onChange={(event) => setCampaignFilter(event.target.value)}>
            <MenuItem value="all">All Campaigns</MenuItem>
            {campaigns.map((c) => <MenuItem key={c.campaignId} value={c.campaignId}>{c.campaignName}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <MenuItem value="all">All Status</MenuItem>
            {Object.keys(STATUS_TONE).map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 920, '& td, & th': { whiteSpace: 'nowrap' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Campaign</TableCell>
              <TableCell>List ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Called</TableCell>
              <TableCell>Last Call</TableCell>
              <TableCell>Next Callback</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((lead) => {
              const campaign = campaigns.find((c) => c.campaignId === lead.campaignId);
              return (
                <TableRow key={lead.leadId} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{lead.firstName} {lead.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{lead.email}</Typography>
                  </TableCell>
                  <TableCell>{lead.phoneNumber}</TableCell>
                  <TableCell>{campaign?.campaignName ?? lead.campaignId}</TableCell>
                  <TableCell>{lead.listId}</TableCell>
                  <TableCell><StatusBadge label={lead.status} tone={STATUS_TONE[lead.status]} /></TableCell>
                  <TableCell>{lead.calledCount}</TableCell>
                  <TableCell>{lead.lastCallTime || '—'}</TableCell>
                  <TableCell>{lead.nextCallbackTime || '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Showing {filtered.length} of {leadsTotalCount.toLocaleString()} leads
      </Typography>
    </Box>
  );
}
