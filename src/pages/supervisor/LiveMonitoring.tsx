import { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Avatar, Stack, Divider,
} from '@mui/material';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import PendingActionsOutlined from '@mui/icons-material/PendingActionsOutlined';
import FreeBreakfastOutlined from '@mui/icons-material/FreeBreakfastOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  liveKpis, liveQueue, liveQueueTotal, agentStatuses, teamPerformanceToday,
  callsOverTime, liveActivityFeed,
} from '../../services/mock/liveMonitoring';
import { colors } from '../../theme/palette';

const WAIT_COLOR: Record<string, string> = { high: colors.error, medium: colors.warning, low: colors.success };
const AGENT_STATUS_COLOR: Record<string, string> = { 'On Call': colors.info, Available: colors.success, 'On Break': colors.warning };

export function LiveMonitoring() {
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box>
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }} component="span">
            <span>Live Monitoring</span>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center', bgcolor: 'rgba(224,32,58,0.1)', color: 'primary.main', borderRadius: 1, px: 1, py: 0.25 }}
              component="span"
            >
              <Box sx={{
                width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main',
                animation: 'pulse 1.4s ease-in-out infinite',
                '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.25 }, '100%': { opacity: 1 } },
              }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Live</Typography>
            </Stack>
          </Stack>
        }
        subtitle="Monitor your team's live activities and performance in real-time."
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">Last updated: {lastUpdated.toLocaleTimeString()}</Typography>
              <IconButton size="small" onClick={() => setLastUpdated(new Date())}><RefreshOutlined fontSize="small" /></IconButton>
            </Stack>
            <Button variant="outlined" startIcon={<FilterListOutlined />}>Filters</Button>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Agents Online" value={liveKpis.agentsOnline.value} icon={PeopleOutlineOutlined} variant="success" caption={liveKpis.agentsOnline.caption} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="On Live Calls" value={liveKpis.onLiveCalls.value} icon={PhoneInTalkOutlined} variant="info" caption={liveKpis.onLiveCalls.caption} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="In Wrap-up" value={liveKpis.inWrapUp.value} icon={PendingActionsOutlined} variant="warning" caption={liveKpis.inWrapUp.caption} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="On Break" value={liveKpis.onBreak.value} icon={FreeBreakfastOutlined} variant="error" caption={liveKpis.onBreak.caption} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Live Call Queue</Typography>
                  <StatusBadge label={String(liveQueueTotal)} tone="primary" />
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Select size="small" defaultValue="all"><MenuItem value="all">All Queues</MenuItem></Select>
                  <Button size="small">View All Queues</Button>
                </Stack>
              </Stack>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 640, '& td, & th': { whiteSpace: 'nowrap' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Position</TableCell>
                      <TableCell>Caller Info</TableCell>
                      <TableCell>Queue</TableCell>
                      <TableCell>Wait Time</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liveQueue.map((call) => (
                      <TableRow key={call.position} hover>
                        <TableCell>{call.position}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{call.callerName[0]}</Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{call.callerName}</Typography>
                              <Typography variant="caption" color="text.secondary">{call.callerPhone}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>{call.queue}</TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 700, color: WAIT_COLOR[call.waitSeverity] }}>{call.waitTime}</Typography></TableCell>
                        <TableCell><StatusBadge label={call.priority} /></TableCell>
                        <TableCell><StatusBadge label="Waiting" /></TableCell>
                        <TableCell align="right"><IconButton size="small" color="primary"><CallOutlined fontSize="small" /></IconButton></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                <Button size="small">View All Queues</Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Agent Status Overview</Typography>
                <Select size="small" defaultValue="all"><MenuItem value="all">All Teams</MenuItem></Select>
              </Stack>
              <Grid container spacing={2}>
                {agentStatuses.map((agent) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={agent.id}>
                    <Stack spacing={1} sx={{ p: 1.5, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{agent.name[0]}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{agent.name}</Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: AGENT_STATUS_COLOR[agent.status] }} />
                            <Typography variant="caption" color="text.secondary">{agent.status}</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">Team: {agent.team}</Typography>
                      <Typography variant="caption" color="text.secondary">{agent.callDuration ?? '--:--'}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button size="small">View All Agents</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Team Performance (Today)</Typography>
                <Select size="small" defaultValue="today"><MenuItem value="today">Today</MenuItem></Select>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Total Calls</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{teamPerformanceToday.totalCalls.value}</Typography>
                  <Typography variant="caption" color="success.main">{teamPerformanceToday.totalCalls.delta}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Answered Calls</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{teamPerformanceToday.answeredCalls.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{teamPerformanceToday.answeredCalls.caption}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Avg. Talk Time</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{teamPerformanceToday.avgTalkTime.value}</Typography>
                  <Typography variant="caption" color="success.main">{teamPerformanceToday.avgTalkTime.delta}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">CSAT Score</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{teamPerformanceToday.csatScore.value}</Typography>
                  <Typography variant="caption" color="success.main">{teamPerformanceToday.csatScore.delta}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Calls Over Time</Typography>
                <Select size="small" defaultValue="today"><MenuItem value="today">Today</MenuItem></Select>
              </Stack>
              <LineChart
                height={220}
                series={[{ data: callsOverTime.map((d) => d.calls), label: 'Calls Handled', color: colors.primary, showMark: false, area: true }]}
                xAxis={[{ data: callsOverTime.map((d) => d.time), scaleType: 'point' }]}
                grid={{ horizontal: true }}
                margin={{ left: 30, right: 10, top: 10, bottom: 24 }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Live Activity Feed</Typography>
                <Button size="small">View All</Button>
              </Stack>
              <Stack divider={<Divider />} spacing={1.5}>
                {liveActivityFeed.map((item) => (
                  <Box key={item.id} sx={{ py: 0.5 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
