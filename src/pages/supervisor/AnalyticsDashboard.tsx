import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { LineChart } from '@mui/x-charts/LineChart';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Box, Grid, Card, CardContent, Typography, Button, Select, MenuItem, Popover,
  Table, TableHead, TableRow, TableCell, TableBody, Avatar, Stack, Divider,
} from '@mui/material';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import ViewColumnOutlined from '@mui/icons-material/ViewColumnOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActivityHeatmap } from '../../components/common/ActivityHeatmap';
import {
  analyticsKpis, trendDates, callVolumeTrends, heatmapDays, heatmapHours, heatmapData,
  topCampaigns, agentPerformance, agentPerformanceTotal,
} from '../../services/mock/analytics';
import { colors } from '../../theme/palette';

export function AnalyticsDashboard() {
  const [rangeAnchor, setRangeAnchor] = useState<HTMLElement | null>(null);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs('2025-04-20'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs('2025-05-20'));
  const [appliedLabel, setAppliedLabel] = useState('Apr 20, 2025 - May 20, 2025');

  const applyRange = () => {
    setAppliedLabel(`${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')}`);
    setRangeAnchor(null);
  };

  return (
    <Box>
      <PageHeader
        title="Report List"
        subtitle="Call volume, contact rates, and agent performance across all campaigns."
        actions={
          <>
            <Button variant="outlined" startIcon={<CalendarMonthOutlined />} onClick={(event) => setRangeAnchor(event.currentTarget)}>
              {appliedLabel}
            </Button>
            <Button variant="outlined" startIcon={<FilterListOutlined />}>Filters</Button>
            <Button variant="contained" startIcon={<FileDownloadOutlined />}>Export Report</Button>
          </>
        }
      />

      <Popover open={Boolean(rangeAnchor)} anchorEl={rangeAnchor} onClose={() => setRangeAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2} sx={{ p: 2.5 }}>
            <DatePicker label="Start date" value={startDate} onChange={(value) => value && setStartDate(value)} slotProps={{ textField: { size: 'small' } }} />
            <DatePicker label="End date" value={endDate} onChange={(value) => value && setEndDate(value)} slotProps={{ textField: { size: 'small' } }} />
            <Button variant="contained" onClick={applyRange}>Apply</Button>
          </Stack>
        </LocalizationProvider>
      </Popover>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {analyticsKpis.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={kpi.label}>
            <KpiCard label={kpi.label} value={kpi.value} delta={kpi.delta} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Call Volume Trends</Typography>
                <Select size="small" defaultValue="daily"><MenuItem value="daily">Daily</MenuItem></Select>
              </Stack>
              <LineChart
                height={300}
                series={[
                  { data: callVolumeTrends.totalCalls, label: 'Total Calls', color: colors.primary, showMark: false },
                  { data: callVolumeTrends.answeredCalls, label: 'Answered Calls', color: colors.info, showMark: false },
                  { data: callVolumeTrends.abandonedCalls, label: 'Abandoned Calls', color: colors.warning, showMark: false },
                ]}
                xAxis={[{ data: trendDates, scaleType: 'point' }]}
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
                <Select size="small" defaultValue="30"><MenuItem value="30">Last 30 Days</MenuItem></Select>
              </Stack>
              <ActivityHeatmap days={heatmapDays} hours={heatmapHours} data={heatmapData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Top Performing Campaigns</Typography>
                <Select size="small" defaultValue="calls"><MenuItem value="calls">By Calls Handled</MenuItem></Select>
              </Stack>
              <Stack divider={<Divider />} spacing={1.5}>
                {topCampaigns.map((campaign) => (
                  <Stack key={campaign.rank} direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 0.5 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(224,32,58,0.1)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {campaign.rank}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{campaign.campaign}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{campaign.callsHandled.toLocaleString()}</Typography>
                    <Typography variant="caption" color="success.main">{campaign.delta}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button size="small">View All Campaigns</Button>
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
                  <Select size="small" defaultValue="all"><MenuItem value="all">All Teams</MenuItem></Select>
                  <Button size="small" variant="outlined" startIcon={<ViewColumnOutlined fontSize="small" />}>Columns</Button>
                  <Button size="small" variant="outlined" startIcon={<FileDownloadOutlined fontSize="small" />}>Download CSV</Button>
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
                    {agentPerformance.map((row) => (
                      <TableRow key={row.agent} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main' }}>{row.agent[0]}</Avatar>
                            {row.agent}
                          </Stack>
                        </TableCell>
                        <TableCell>{row.team}</TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell>{row.callsHandled}</TableCell>
                        <TableCell>{row.activeDays}</TableCell>
                        <TableCell>{row.talkTime}</TableCell>
                        <TableCell>{row.conversions}</TableCell>
                        <TableCell>{row.lastLogin}</TableCell>
                        <TableCell><StatusBadge label={row.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing 1 to {agentPerformance.length} of {agentPerformanceTotal} agents
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {[1, 2, 3].map((p) => (
                    <Button key={p} size="small" variant={p === 1 ? 'contained' : 'text'} sx={{ minWidth: 32 }}>{p}</Button>
                  ))}
                  <Typography sx={{ px: 1, alignSelf: 'center' }}>...</Typography>
                  <Button size="small" variant="text" sx={{ minWidth: 32 }}>26</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
