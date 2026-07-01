import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { LineChart } from '@mui/x-charts/LineChart';
import {
  Box, Grid, Card, CardContent, Typography, Button, Select, MenuItem, TextField,
  Table, TableHead, TableRow, TableCell, TableBody, Avatar, Stack, Divider,
  FormControl, InputLabel, Alert, CircularProgress,
} from '@mui/material';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActivityHeatmap } from '../../components/common/ActivityHeatmap';
import { useApiData } from '../../hooks/useApiData';
import { fetchAnalytics, fetchCampaigns } from '../../services/api/client';
import { downloadCsv } from '../../utils/csv';
import { colors } from '../../theme/palette';

const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEATMAP_HOURS = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
const AGENT_PAGE_SIZE = 10;

function formatSeconds(totalSec: number): string {
  if (!totalSec) return '—';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(dayjs().subtract(29, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [campaignId, setCampaignId] = useState('');
  const [team, setTeam] = useState('all');
  const [agentPage, setAgentPage] = useState(0);

  const { data: campaigns } = useApiData(fetchCampaigns);
  const { data, loading, error, reload } = useApiData(
    () => fetchAnalytics({ startDate, endDate, campaignId: campaignId || undefined }),
  );

  const campaignList = campaigns ?? [];
  const kpis = data?.kpis;
  const trend = data?.trend;
  const heatmapData = data?.heatmap.data ?? HEATMAP_DAYS.map(() => HEATMAP_HOURS.map(() => 0));
  const topCampaigns = data?.topCampaigns ?? [];
  const allAgents = data?.agentPerformance ?? [];

  const teams = [...new Set(allAgents.map((a) => a.team))].sort();
  const filteredAgents = team === 'all' ? allAgents : allAgents.filter((a) => a.team === team);
  const agentPageCount = Math.max(1, Math.ceil(filteredAgents.length / AGENT_PAGE_SIZE));
  const pagedAgents = filteredAgents.slice(agentPage * AGENT_PAGE_SIZE, (agentPage + 1) * AGENT_PAGE_SIZE);

  const handleApply = () => { setAgentPage(0); reload(); };

  const handleExport = () => {
    downloadCsv(
      `agent-performance_${startDate}_${endDate}.csv`,
      ['Agent', 'Team', 'Role', 'Calls Handled', 'Active Days', 'Talk Time (sec)', 'Conversions', 'Last Login', 'Status'],
      filteredAgents.map((a) => [
        a.fullName, a.team, a.role, a.callsHandled, a.activeDays, a.talkTimeSec, a.conversions,
        a.lastLogin ?? '', a.active ? 'Active' : 'Inactive',
      ]),
    );
  };

  return (
    <Box>
      <PageHeader
        title="Report List"
        subtitle="Call volume, contact rates, and agent performance across all campaigns."
        actions={
          <Button variant="contained" startIcon={<FileDownloadOutlined />} onClick={handleExport} disabled={!filteredAgents.length}>
            Export Report
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Start Date" type="date" size="small" value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Date" type="date" size="small" value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Campaign</InputLabel>
              <Select label="Campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
                <MenuItem value="">All Campaigns</MenuItem>
                {campaignList.map((c) => (
                  <MenuItem key={c.campaignId} value={c.campaignId}>{c.campaignName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleApply}>Apply</Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <KpiCard label="Total Calls" value={kpis?.totalCalls ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <KpiCard label="Answered Calls" value={kpis?.answeredCalls ?? 0} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <KpiCard label="Avg. Handle Time" value={formatSeconds(kpis?.avgHandleSec ?? 0)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <KpiCard label="Contact Rate" value={`${kpis?.contactRatePct ?? 0}%`} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <KpiCard label="Conversion Rate" value={`${kpis?.conversionRatePct ?? 0}%`} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <KpiCard label="Calls Abandoned" value={kpis?.abandonedCalls ?? 0} />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Call Volume Trends</Typography>
                    <Typography variant="caption" color="text.secondary">Daily</Typography>
                  </Stack>
                  <LineChart
                    height={300}
                    series={[
                      { data: trend?.totalCalls ?? [], label: 'Total Calls', color: colors.primary, showMark: false },
                      { data: trend?.answeredCalls ?? [], label: 'Answered Calls', color: colors.info, showMark: false },
                      { data: trend?.abandonedCalls ?? [], label: 'Abandoned Calls', color: colors.warning, showMark: false },
                    ]}
                    xAxis={[{ data: trend?.dates ?? [], scaleType: 'point' }]}
                    grid={{ horizontal: true }}
                    margin={{ left: 40, right: 30, top: 10, bottom: 30 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Call Volume Heatmap</Typography>
                    <Typography variant="caption" color="text.secondary">Selected range</Typography>
                  </Stack>
                  <ActivityHeatmap days={HEATMAP_DAYS} hours={HEATMAP_HOURS} data={heatmapData} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top Performing Campaigns</Typography>
                  {topCampaigns.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No calls in this range yet.</Typography>
                  ) : (
                    <Stack divider={<Divider />} spacing={1.5}>
                      {topCampaigns.map((campaign) => (
                        <Stack key={campaign.campaignId} direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 0.5 }}>
                          <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(224,32,58,0.1)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                            {campaign.rank}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>{campaign.campaignName}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{campaign.callsHandled.toLocaleString()}</Typography>
                          <Typography variant="caption" color={campaign.delta.startsWith('-') ? 'error.main' : 'success.main'}>{campaign.delta}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button size="small" onClick={() => navigate('/admin/campaigns')}>View All Campaigns</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Agent Performance Summary</Typography>
                    <Stack direction="row" spacing={1.5}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Team</InputLabel>
                        <Select label="Team" value={team} onChange={(e) => { setTeam(e.target.value); setAgentPage(0); }}>
                          <MenuItem value="all">All Teams</MenuItem>
                          {teams.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <Button size="small" variant="outlined" startIcon={<FileDownloadOutlined fontSize="small" />} onClick={handleExport} disabled={!filteredAgents.length}>
                        Download CSV
                      </Button>
                    </Stack>
                  </Stack>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 760, '& td, & th': { whiteSpace: 'nowrap' } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Agent</TableCell>
                          <TableCell>Team</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Calls Handled</TableCell>
                          <TableCell>Active Days</TableCell>
                          <TableCell>Talk Time</TableCell>
                          <TableCell>Conversions</TableCell>
                          <TableCell>Last Login</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedAgents.map((row) => (
                          <TableRow key={row.user} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>{row.fullName[0]}</Avatar>
                                {row.fullName}
                              </Stack>
                            </TableCell>
                            <TableCell>{row.team}</TableCell>
                            <TableCell>{row.role}</TableCell>
                            <TableCell>{row.callsHandled}</TableCell>
                            <TableCell>{row.activeDays}</TableCell>
                            <TableCell>{formatSeconds(row.talkTimeSec)}</TableCell>
                            <TableCell>{row.conversions}</TableCell>
                            <TableCell>{row.lastLogin ?? '—'}</TableCell>
                            <TableCell><StatusBadge label={row.active ? 'Active' : 'Inactive'} tone={row.active ? 'success' : 'neutral'} /></TableCell>
                          </TableRow>
                        ))}
                        {pagedAgents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              No agents match this filter.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                  {filteredAgents.length > 0 && (
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Showing {agentPage * AGENT_PAGE_SIZE + 1} to {Math.min((agentPage + 1) * AGENT_PAGE_SIZE, filteredAgents.length)} of {filteredAgents.length} agents
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {Array.from({ length: agentPageCount }, (_, p) => (
                          <Button key={p} size="small" variant={p === agentPage ? 'contained' : 'text'} sx={{ minWidth: 32 }} onClick={() => setAgentPage(p)}>
                            {p + 1}
                          </Button>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
