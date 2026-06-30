import { useState } from 'react';
import {
  Box, Grid, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Stack, Chip, Typography, CircularProgress, Alert,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { fetchCampaigns } from '../../services/api/client';
import { useApiData } from '../../hooks/useApiData';
import type { Campaign } from '../../types/vicidial';

export function Campaigns() {
  const { data: campaigns, loading, error } = useApiData(fetchCampaigns);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const list = campaigns ?? [];
  const activeCount = list.filter((c) => c.active).length;
  const pausedCount = list.filter((c) => !c.active).length;

  return (
    <Box>
      <PageHeader
        title="Blended Campaign"
        subtitle="View and manage inbound/outbound campaigns configured in VICIdial."
        actions={<Button variant="contained" startIcon={<AddOutlined />}>New Campaign</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Total Campaigns" value={list.length} icon={ListAltOutlined} variant="neutral" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Active" value={activeCount} icon={CampaignOutlined} variant="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Paused" value={pausedCount} icon={PauseCircleOutlined} variant="warning" />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {!loading && (
          <Table size="small" sx={{ minWidth: 780, '& td, & th': { whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dial Method</TableCell>
                <TableCell>Dial Level</TableCell>
                <TableCell>Hopper</TableCell>
                <TableCell>Call Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((campaign) => (
                <TableRow
                  key={campaign.campaignId}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => { setSelected(campaign); setActiveTab(0); }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{campaign.campaignName}</Typography>
                    <Typography variant="caption" color="text.secondary">{campaign.campaignId}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={campaign.active ? 'Active' : 'Paused'} tone={campaign.active ? 'success' : 'neutral'} />
                  </TableCell>
                  <TableCell>{campaign.type}</TableCell>
                  <TableCell>{campaign.dialMethod}</TableCell>
                  <TableCell>{campaign.dialLevel}</TableCell>
                  <TableCell>{campaign.leadsLoaded}</TableCell>
                  <TableCell>{campaign.leadOrder || '—'}</TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No campaigns found in VICIdial.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Box>

      {selected && (
        <DetailDrawer
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          header={
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Typography variant="h6">{selected.campaignName}</Typography>
                <StatusBadge label={selected.active ? 'Active' : 'Paused'} tone={selected.active ? 'success' : 'neutral'} />
              </Stack>
              <Typography variant="body2" color="text.secondary">Campaign ID: {selected.campaignId}</Typography>
            </Box>
          }
          tabs={[
            {
              label: 'Dial Settings',
              content: (
                <Stack spacing={1.5}>
                  {([
                    ['Dial Method', selected.dialMethod],
                    ['Dial Level', selected.dialLevel],
                    ['Type', selected.type],
                    ['Status', selected.status],
                  ] as const).map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  ))}
                  {selected.dialStatuses.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Dial Statuses</Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {selected.dialStatuses.map((status) => <Chip key={status} label={status} size="small" />)}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              ),
            },
          ]}
          footer={
            <>
              <Button variant="outlined">{selected.active ? 'Pause Campaign' : 'Resume Campaign'}</Button>
              <Button variant="contained">Edit Campaign</Button>
            </>
          }
        />
      )}
    </Box>
  );
}
