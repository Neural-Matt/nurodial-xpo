import type { ElementType } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import StarOutlined from '@mui/icons-material/StarOutlined';
import QueueOutlined from '@mui/icons-material/QueueOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import { KpiCard, type KpiVariant } from '../components/common/KpiCard';
import { useRole } from '../context/useRole';
import type { Role } from '../types';

interface DashboardKpi {
  label: string;
  value: string | number;
  icon: ElementType;
  variant: KpiVariant;
}

const ROLE_KPIS: Record<Role, DashboardKpi[]> = {
  Administrator: [
    { label: 'Active Calls', value: 12, icon: PhoneInTalkOutlined, variant: 'info' },
    { label: 'Agents Online', value: 34, icon: PeopleOutlineOutlined, variant: 'success' },
    { label: 'Avg. Wait Time', value: '00:01:23', icon: AccessTimeOutlined, variant: 'warning' },
    { label: 'Active Campaigns', value: 5, icon: CampaignOutlined, variant: 'primary' },
  ],
  Agent: [
    { label: 'My Calls Today', value: 18, icon: PhoneInTalkOutlined, variant: 'info' },
    { label: 'Avg. Handle Time', value: '00:04:12', icon: AccessTimeOutlined, variant: 'warning' },
    { label: 'Tasks Due', value: 3, icon: TaskAltOutlined, variant: 'primary' },
    { label: 'CSAT Score', value: '4.7/5', icon: StarOutlined, variant: 'success' },
  ],
  Supervisor: [
    { label: 'Agents Online', value: 32, icon: PeopleOutlineOutlined, variant: 'success' },
    { label: 'Calls in Queue', value: 24, icon: QueueOutlined, variant: 'warning' },
    { label: 'SLA Today', value: '91%', icon: TrendingUpOutlined, variant: 'info' },
    { label: 'Avg. Wait Time', value: '00:01:48', icon: AccessTimeOutlined, variant: 'primary' },
  ],
  QualityAssurance: [
    { label: 'Evaluations Pending', value: 12, icon: AssignmentTurnedInOutlined, variant: 'warning' },
    { label: 'Avg. QA Score', value: '87%', icon: TrendingUpOutlined, variant: 'success' },
    { label: 'Disputes Open', value: 3, icon: ReportProblemOutlined, variant: 'error' },
    { label: 'Calibration Sessions', value: 2, icon: TuneOutlined, variant: 'info' },
  ],
  CampaignManager: [
    { label: 'Active Campaigns', value: 7, icon: CampaignOutlined, variant: 'primary' },
    { label: 'Leads in Queue', value: 1240, icon: ListAltOutlined, variant: 'warning' },
    { label: 'Contact Rate', value: '64%', icon: TrendingUpOutlined, variant: 'info' },
    { label: 'Conversion Rate', value: '18%', icon: TrendingUpOutlined, variant: 'success' },
  ],
};

export function Dashboard() {
  const { role, displayName } = useRole();
  const kpis = ROLE_KPIS[role];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        Welcome back, {displayName.split(' ')[0]}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Here's what's happening with your {role === 'Administrator' ? 'organization' : 'work'} today.
      </Typography>
      <Grid container spacing={2}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.label}>
            <KpiCard label={kpi.label} value={kpi.value} icon={kpi.icon} variant={kpi.variant} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
