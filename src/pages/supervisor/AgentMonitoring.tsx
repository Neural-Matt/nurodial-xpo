import { Box, Grid, Card, CardContent, Typography, Avatar, Stack, Select, MenuItem, Button } from '@mui/material';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import FreeBreakfastOutlined from '@mui/icons-material/FreeBreakfastOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { agentStatuses, liveKpis } from '../../services/mock/liveMonitoring';
import { colors } from '../../theme/palette';

const AGENT_STATUS_COLOR: Record<string, string> = { 'On Call': colors.info, Available: colors.success, 'On Break': colors.warning };
const availableCount = agentStatuses.filter((a) => a.status === 'Available').length;
const onBreakCount = agentStatuses.filter((a) => a.status === 'On Break').length;

export function AgentMonitoring() {
  return (
    <Box>
      <PageHeader
        title="Agent Monitoring"
        subtitle="Real-time agent status, login activity, and current campaign assignment."
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Agents Online" value={liveKpis.agentsOnline.value} icon={PeopleOutlineOutlined} variant="success" caption={liveKpis.agentsOnline.caption} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="On Call" value={liveKpis.onLiveCalls.value} icon={PhoneInTalkOutlined} variant="info" caption={liveKpis.onLiveCalls.caption} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Available" value={availableCount} icon={CheckCircleOutlined} variant="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="On Break" value={onBreakCount} icon={FreeBreakfastOutlined} variant="warning" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Agent Status</Typography>
            <Select size="small" defaultValue="all"><MenuItem value="all">All Teams</MenuItem></Select>
          </Stack>
          <Grid container spacing={2}>
            {agentStatuses.map((agent) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={agent.id}>
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
                  <Typography variant="caption" color="text.secondary">Call duration: {agent.callDuration ?? '--:--'}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button size="small">View All Agents</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
