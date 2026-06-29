import { useState } from 'react';
import {
  Box, Grid, Button, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Stack, Chip, Typography,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { campaigns } from '../../services/mock/campaigns';
import type { Campaign } from '../../types/vicidial';

function formatSeconds(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Campaigns() {
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const activeCount = campaigns.filter((c) => c.active).length;
  const totalAgents = campaigns.reduce((sum, c) => sum + c.activeAgents, 0);
  const avgContactRate = Math.round(campaigns.reduce((sum, c) => sum + c.contactRate, 0) / campaigns.length);
  const avgConversionRate = Math.round(campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length);

  return (
    <Box>
      <PageHeader
        title="Campaigns"
        subtitle="Manage VICIDial dialer campaigns, dial settings, and lead pacing."
        actions={<Button variant="contained" startIcon={<AddOutlined />}>New Campaign</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Active Campaigns" value={activeCount} icon={CampaignOutlined} variant="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Active Agents" value={totalAgents} icon={PeopleOutlineOutlined} variant="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Avg. Contact Rate" value={`${avgContactRate}%`} icon={TrendingUpOutlined} variant="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Avg. Conversion Rate" value={`${avgConversionRate}%`} icon={TrendingUpOutlined} variant="warning" />
        </Grid>
      </Grid>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 980, '& td, & th': { whiteSpace: 'nowrap' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Campaign</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Dial Method</TableCell>
              <TableCell>Agents</TableCell>
              <TableCell>Leads Remaining</TableCell>
              <TableCell>Contact Rate</TableCell>
              <TableCell>Conversion Rate</TableCell>
              <TableCell>Drop Rate</TableCell>
              <TableCell>Avg. Handle Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => {
              const pct = campaign.leadsLoaded
                ? Math.round(((campaign.leadsLoaded - campaign.leadsRemaining) / campaign.leadsLoaded) * 100)
                : 0;
              return (
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
                  <TableCell><StatusBadge label={campaign.active ? 'Active' : 'Paused'} tone={campaign.active ? 'success' : 'neutral'} /></TableCell>
                  <TableCell>{campaign.dialMethod}</TableCell>
                  <TableCell>{campaign.activeAgents}</TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    <Typography variant="caption" color="text.secondary">
                      {campaign.leadsRemaining.toLocaleString()} / {campaign.leadsLoaded.toLocaleString()}
                    </Typography>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 5, borderRadius: 3, mt: 0.5 }} />
                  </TableCell>
                  <TableCell>{campaign.contactRate}%</TableCell>
                  <TableCell>{campaign.conversionRate}%</TableCell>
                  <TableCell>{campaign.dropRate}%</TableCell>
                  <TableCell>{formatSeconds(campaign.avgHandleTime)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
                    ['Lead Order', selected.leadOrder],
                    ['Dial Timeout', `${selected.dialTimeout}s`],
                  ] as const).map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  ))}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Dial Statuses</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {selected.dialStatuses.map((status) => <Chip key={status} label={status} size="small" />)}
                    </Stack>
                  </Box>
                </Stack>
              ),
            },
            {
              label: 'Performance',
              content: (
                <Stack spacing={1.5}>
                  {([
                    ['Active Agents', selected.activeAgents],
                    ['Contact Rate', `${selected.contactRate}%`],
                    ['Conversion Rate', `${selected.conversionRate}%`],
                    ['Drop Rate', `${selected.dropRate}%`],
                    ['Avg. Handle Time', formatSeconds(selected.avgHandleTime)],
                  ] as const).map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  ))}
                </Stack>
              ),
            },
            {
              label: 'Leads',
              content: (
                <Stack spacing={1.5}>
                  {([
                    ['Leads Loaded', selected.leadsLoaded.toLocaleString()],
                    ['Leads Remaining', selected.leadsRemaining.toLocaleString()],
                  ] as const).map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Box>
                  ))}
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
