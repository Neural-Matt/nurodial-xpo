import { useEffect, useRef, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Select, MenuItem,
  Avatar, Stack, Alert, Chip, FormControl, InputLabel, Tooltip, Button, Snackbar,
} from '@mui/material';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import HeadsetMicOutlined from '@mui/icons-material/HeadsetMicOutlined';
import RecordVoiceOverOutlined from '@mui/icons-material/RecordVoiceOverOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import {
  fetchLiveAgents, fetchAgentPhones, monitorAgent,
  type LiveAgent, type LiveAgentStatus, type MonitorMode,
} from '../../services/api/client';
import { colors } from '../../theme/palette';

const POLL_INTERVAL_MS = 10_000;
const SUPERVISOR_EXTENSION_KEY = 'nurodial.supervisor.extension';

// --- status display config ---------------------------------------------------

interface StatusConfig {
  label: string;
  color: string;
  pulse: boolean;
}

const STATUS_CONFIG: Record<LiveAgentStatus, StatusConfig> = {
  INCALL:  { label: 'On Call',   color: colors.info,    pulse: true  },
  READY:   { label: 'Available', color: colors.success,  pulse: false },
  QUEUE:   { label: 'In Queue',  color: colors.info,    pulse: false },
  PAUSED:  { label: 'Paused',    color: colors.warning,  pulse: false },
  CLOSER:  { label: 'Inbound',   color: colors.info,    pulse: true  },
  MQUEUE:  { label: 'Multi-Q',   color: colors.info,    pulse: false },
};

function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// --- AgentCard ---------------------------------------------------------------

interface AgentCardProps {
  agent: LiveAgent;
  fetchedAt: number; // ms timestamp of last successful fetch
  myExtension: string;
  onMonitor: (agent: LiveAgent, mode: MonitorMode) => void;
  monitoringKey: string | null; // `${user}:${mode}` of an in-flight request, for disabling buttons
}

function AgentCard({ agent, fetchedAt, myExtension, onMonitor, monitoringKey }: AgentCardProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const cfg = STATUS_CONFIG[agent.status] ?? { label: agent.status, color: colors.info, pulse: false };
  const elapsedSec = agent.statusDurationSec + Math.floor((Date.now() - fetchedAt) / 1000);
  const initials = agent.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Tooltip title={`@${agent.user}`} placement="top">
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{agent.fullName}</Typography>
            </Tooltip>
            <Typography variant="caption" color="text.secondary" noWrap>{agent.campaignId || 'No campaign'}</Typography>
          </Box>
        </Stack>

        {/* Status row */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0,
            ...(cfg.pulse && {
              animation: 'ndPulse 1.4s ease-in-out infinite',
              '@keyframes ndPulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.25 }, '100%': { opacity: 1 } },
            }),
          }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important', fontVariantNumeric: 'tabular-nums' }}>
            {formatDuration(elapsedSec)}
          </Typography>
        </Stack>

        {/* Stats row */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label={`${agent.callsToday} calls`}
            size="small"
            sx={{ fontSize: 11, height: 20 }}
          />
          {agent.extension && (
            <Chip label={`ext. ${agent.extension}`} size="small" sx={{ fontSize: 11, height: 20 }} />
          )}
          {agent.status === 'PAUSED' && agent.pauseCodeLabel && (
            <Chip
              label={agent.pauseCodeLabel}
              size="small"
              sx={{ fontSize: 11, height: 20, bgcolor: `${colors.warning}22`, color: colors.warning, fontWeight: 600 }}
            />
          )}
          {agent.status === 'INCALL' && agent.callerId && (
            <Chip
              label={agent.callerId}
              size="small"
              sx={{ fontSize: 11, height: 20, bgcolor: `${colors.info}22`, color: colors.info }}
            />
          )}
        </Stack>

        {agent.status === 'INCALL' && (
          <Tooltip title={myExtension ? '' : 'Choose your phone extension above first'}>
            <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }}>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                startIcon={<HeadsetMicOutlined fontSize="small" />}
                disabled={!myExtension || monitoringKey === `${agent.user}:monitor`}
                onClick={() => onMonitor(agent, 'monitor')}
                sx={{ fontSize: 11, minWidth: 0, px: 0.5 }}
              >
                Monitor
              </Button>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                startIcon={<RecordVoiceOverOutlined fontSize="small" />}
                disabled={!myExtension || monitoringKey === `${agent.user}:whisper`}
                onClick={() => onMonitor(agent, 'whisper')}
                sx={{ fontSize: 11, minWidth: 0, px: 0.5 }}
              >
                Whisper
              </Button>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                startIcon={<CampaignOutlined fontSize="small" />}
                disabled={!myExtension || monitoringKey === `${agent.user}:barge`}
                onClick={() => onMonitor(agent, 'barge')}
                sx={{ fontSize: 11, minWidth: 0, px: 0.5 }}
              >
                Barge
              </Button>
            </Stack>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
}

// --- LiveMonitoring ----------------------------------------------------------

export function LiveMonitoring() {
  const [agents, setAgents] = useState<LiveAgent[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [campaignFilter, setCampaignFilter] = useState('all');
  const fetchingRef = useRef(false);

  const [phones, setPhones] = useState<{ extension: string; protocol: string }[]>([]);
  const [myExtension, setMyExtension] = useState(() => localStorage.getItem(SUPERVISOR_EXTENSION_KEY) ?? '');
  const [monitoringKey, setMonitoringKey] = useState<string | null>(null);
  const [monitorError, setMonitorError] = useState<string | null>(null);
  const [monitorSuccess, setMonitorSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAgentPhones().then(setPhones).catch(() => {});
  }, []);

  const handleExtensionChange = (value: string) => {
    setMyExtension(value);
    localStorage.setItem(SUPERVISOR_EXTENSION_KEY, value);
  };

  const handleMonitor = (agent: LiveAgent, mode: MonitorMode) => {
    if (!myExtension) return;
    const key = `${agent.user}:${mode}`;
    setMonitoringKey(key);
    setMonitorError(null);
    monitorAgent(agent.user, mode, myExtension)
      .then(() => setMonitorSuccess(`Ringing your phone (ext. ${myExtension}) to ${mode} ${agent.fullName}…`))
      .catch((err: unknown) => setMonitorError(err instanceof Error ? err.message : `Failed to ${mode} ${agent.fullName}.`))
      .finally(() => setMonitoringKey((k) => (k === key ? null : k)));
  };

  const doFetch = () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    fetchLiveAgents()
      .then((data) => {
        setAgents(data);
        setFetchedAt(Date.now());
        setLastUpdated(new Date());
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load live agents.');
      })
      .finally(() => {
        setLoading(false);
        fetchingRef.current = false;
      });
  };

  useEffect(() => {
    doFetch();
    const id = setInterval(doFetch, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = agents ?? [];
  const campaigns = [...new Set(list.map((a) => a.campaignId).filter(Boolean))].sort();
  const filtered = campaignFilter === 'all' ? list : list.filter((a) => a.campaignId === campaignFilter);

  const kpis = {
    online:    list.length,
    onCall:    list.filter((a) => a.status === 'INCALL' || a.status === 'CLOSER').length,
    available: list.filter((a) => a.status === 'READY' || a.status === 'QUEUE').length,
    paused:    list.filter((a) => a.status === 'PAUSED').length,
  };

  const liveIndicator = (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', bgcolor: 'rgba(224,32,58,0.1)', color: 'primary.main', borderRadius: 1, px: 1, py: 0.25 }} component="span">
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', animation: 'ndPulse 1.4s ease-in-out infinite', '@keyframes ndPulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.25 }, '100%': { opacity: 1 } } }} />
      <Typography variant="caption" sx={{ fontWeight: 700 }}>Live</Typography>
    </Stack>
  );

  return (
    <Box>
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }} component="span">
            <span>Live Monitoring</span>
            {liveIndicator}
          </Stack>
        }
        subtitle="Real-time agent status from VICIdial. Refreshes every 10 seconds."
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Updated {lastUpdated.toLocaleTimeString()}
            </Typography>
            <IconButton size="small" onClick={doFetch} disabled={loading}>
              <RefreshOutlined fontSize="small" />
            </IconButton>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Your Phone</InputLabel>
              <Select
                label="Your Phone"
                value={myExtension}
                onChange={(e) => handleExtensionChange(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Choose extension…</MenuItem>
                {phones.map((phone) => (
                  <MenuItem key={phone.extension} value={phone.extension}>
                    {phone.extension} ({phone.protocol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {campaigns.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Campaign</InputLabel>
                <Select label="Campaign" value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)}>
                  <MenuItem value="all">All Campaigns</MenuItem>
                  {campaigns.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </Stack>
        }
      />

      {/* KPI Summary */}
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
      {monitorError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setMonitorError(null)}>{monitorError}</Alert>}

      {/* Agent Wall */}
      {!loading && filtered.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PeopleOutlineOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
              No agents logged in
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              Agent cards will appear here as agents log into VICIdial.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((agent) => (
            <Grid key={agent.user} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <AgentCard
                agent={agent}
                fetchedAt={fetchedAt}
                myExtension={myExtension}
                onMonitor={handleMonitor}
                monitoringKey={monitoringKey}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={Boolean(monitorSuccess)}
        autoHideDuration={4000}
        onClose={() => setMonitorSuccess(null)}
        message={monitorSuccess}
      />
    </Box>
  );
}
