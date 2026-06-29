import { Box, Grid, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton } from '@mui/material';
import QueueOutlined from '@mui/icons-material/QueueOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { callQueues } from '../../services/mock/callQueues';

function formatSeconds(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function serviceLevelTone(value: number): 'success' | 'warning' | 'error' {
  if (value >= 80) return 'success';
  if (value >= 60) return 'warning';
  return 'error';
}

export function CallQueues() {
  const totalWaiting = callQueues.reduce((sum, q) => sum + q.waitingCalls, 0);
  const avgServiceLevel = Math.round(callQueues.reduce((sum, q) => sum + q.serviceLevel, 0) / callQueues.length);
  const totalAbandoned = callQueues.reduce((sum, q) => sum + q.abandonedCalls, 0);
  const totalAvailable = callQueues.reduce((sum, q) => sum + q.agentsAvailable, 0);

  return (
    <Box>
      <PageHeader title="Call Queues" subtitle="Monitor service levels and staffing across all call queues." />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Calls Waiting" value={totalWaiting} icon={QueueOutlined} variant="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Avg. Service Level" value={`${avgServiceLevel}%`} icon={TrendingUpOutlined} variant={serviceLevelTone(avgServiceLevel)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Abandoned Today" value={totalAbandoned} icon={AccessTimeOutlined} variant="error" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard label="Agents Available" value={totalAvailable} icon={PeopleOutlineOutlined} variant="success" />
        </Grid>
      </Grid>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 860, '& td, & th': { whiteSpace: 'nowrap' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Queue</TableCell>
              <TableCell>Waiting Calls</TableCell>
              <TableCell>Longest Wait</TableCell>
              <TableCell>Avg. Wait</TableCell>
              <TableCell>Service Level</TableCell>
              <TableCell>Abandoned</TableCell>
              <TableCell>Agents Available</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {callQueues.map((queue) => (
              <TableRow key={queue.queueId} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{queue.queueName}</Typography>
                  <Typography variant="caption" color="text.secondary">{queue.queueId}</Typography>
                </TableCell>
                <TableCell>{queue.waitingCalls}</TableCell>
                <TableCell>{formatSeconds(queue.longestWait)}</TableCell>
                <TableCell>{formatSeconds(queue.averageWait)}</TableCell>
                <TableCell><StatusBadge label={`${queue.serviceLevel}%`} tone={serviceLevelTone(queue.serviceLevel)} /></TableCell>
                <TableCell>{queue.abandonedCalls}</TableCell>
                <TableCell>{queue.agentsAvailable}</TableCell>
                <TableCell align="right"><IconButton size="small" color="primary"><CallOutlined fontSize="small" /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
