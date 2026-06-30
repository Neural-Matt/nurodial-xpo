import { useEffect, useRef, useState } from 'react';
import {
  Box, Card, CardContent, Grid, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, Avatar, Stack, IconButton, Alert, Tooltip,
} from '@mui/material';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fetchAgentStats, type AgentStat, type LiveAgentStatus } from '../../services/api/client';
import { colors } from '../../theme/palette';

const POLL_MS = 30_000;

const STATUS_LABEL: Record<LiveAgentStatus, string> = {
  READY:  'Available',
  INCALL: 'On Call',
  PAUSED: 'Paused',
  QUEUE:  'In Queue',
  CLOSER: 'Inbound',
  MQUEUE: 'Multi-Q',
};

const STATUS_TONE: Record<LiveAgentStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  READY:  'success',
  INCALL: 'info',
  CLOSER: 'info',
  QUEUE:  'info',
  PAUSED: 'warning',
  MQUEUE: 'neutral',
};

const STATUS_DOT: Record<LiveAgentStatus, string> = {
  INCALL:  colors.info,
  CLOSER:  colors.info,
  READY:   colors.success,
  QUEUE:   colors.info,
  PAUSED:  colors.warning,
  MQUEUE:  colors.info,
};

function formatTime(totalSec: number): string {
  if (totalSec <= 0) return '—';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function AgentMonitoring() {
  const [agents, setAgents] = useState<AgentStat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const fetchingRef = useRef(false);

  const doFetch = () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    fetchAgentStats()
      .then((data) => { setAgents(data); setLastUpdated(new Date()); setError(null); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Failed to load agent stats.'); })
      .finally(() => { setLoading(false); fetchingRef.current = false; });
  };

  useEffect(() => {
    doFetch();
    const id = setInterval(doFetch, POLL_MS);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = agents ?? [];
  const kpis = {
    online:    list.length,
    onCall:    list.filter((a) => a.status === 'INCALL' || a.status === 'CLOSER').length,
    available: list.filter((a) => a.status === 'READY' || a.status === 'QUEUE').length,
    paused:    list.filter((a) => a.status === 'PAUSED').length,
  };

  return (
    <Box>
      <PageHeader
        title="Agent Monitoring"
        subtitle="Live status and today's performance for every logged-in agent."
        actions={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Updated {lastUpdated.toLocaleTimeString()}
            </Typography>
            <IconButton size="small" onClick={doFetch} disabled={loading}>
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Agents Online" value={kpis.online} icon={PeopleOutlineOutlined} variant="neutral" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="On Call" value={kpis.onCall} icon={PhoneInTalkOutlined} variant="info" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Available" value={kpis.available} icon={CheckCircleOutlined} variant="success" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Paused" value={kpis.paused} icon={PauseCircleOutlined} variant="warning" />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {!loading && list.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PeopleOutlineOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                No agents logged in
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                Agent rows will appear here as agents log into VICIdial.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 900, '& td, & th': { whiteSpace: 'nowrap' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Agent</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Time in Status</TableCell>
                    <TableCell align="right">Calls Today</TableCell>
                    <TableCell align="right">Talk Time</TableCell>
                    <TableCell align="right">Avg Handle</TableCell>
                    <TableCell align="right">Pause Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((agent) => {
                    const initials = agent.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <TableRow key={agent.user} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main', flexShrink: 0 }}>
                              {initials}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{agent.fullName}</Typography>
                              <Typography variant="caption" color="text.secondary">{agent.extension ? `ext. ${agent.extension}` : agent.user}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: STATUS_DOT[agent.status], flexShrink: 0 }} />
                            <StatusBadge label={STATUS_LABEL[agent.status] ?? agent.status} tone={STATUS_TONE[agent.status] ?? 'neutral'} />
                            {agent.status === 'PAUSED' && agent.pauseCodeLabel && (
                              <Tooltip title={agent.pauseCodeLabel}>
                                <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {agent.pauseCodeLabel}
                                </Typography>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>{agent.campaignId || '—'}</TableCell>
                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatTime(agent.statusDurationSec)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{agent.callsToday}</TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(agent.totalTalkSec)}</TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(agent.avgTalkSec)}</TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(agent.totalPauseSec)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
