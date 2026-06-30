import { Box, Grid, Typography, Alert, Skeleton } from '@mui/material';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import QueueOutlined from '@mui/icons-material/QueueOutlined';
import PauseCircleOutlined from '@mui/icons-material/PauseCircleOutlined';
import FiberNewOutlined from '@mui/icons-material/FiberNewOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import { KpiCard, type KpiVariant } from '../components/common/KpiCard';
import { useAuth } from '../context/useAuth';
import { useApiData } from '../hooks/useApiData';
import { fetchDashboardStats, type DashboardStats } from '../services/api/client';
import type { Role } from '../types';

function formatDuration(totalSec: number): string {
  if (totalSec <= 0) return '00:00';
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface KpiDef {
  label: string;
  value: (s: DashboardStats) => string | number;
  icon: React.ElementType;
  variant: KpiVariant;
}

const ROLE_KPIS: Record<Role, KpiDef[]> = {
  Administrator: [
    { label: 'Agents Online',     value: (s) => s.agentsOnline,                     icon: PeopleOutlineOutlined, variant: 'success'  },
    { label: 'Active Calls',      value: (s) => s.activeCalls,                       icon: PhoneInTalkOutlined,   variant: 'info'     },
    { label: 'Calls Today',       value: (s) => s.callsToday,                        icon: BarChartOutlined,      variant: 'neutral'  },
    { label: 'Active Campaigns',  value: (s) => s.activeCampaigns,                   icon: CampaignOutlined,      variant: 'primary'  },
    { label: 'Agents Paused',     value: (s) => s.pausedAgents,                      icon: PauseCircleOutlined,   variant: 'warning'  },
    { label: 'New Leads',         value: (s) => s.newLeads.toLocaleString(),          icon: FiberNewOutlined,      variant: 'info'     },
    { label: 'Avg Handle Time',   value: (s) => formatDuration(s.avgTalkSecToday),   icon: AccessTimeOutlined,    variant: 'warning'  },
  ],
  Supervisor: [
    { label: 'Agents Online',     value: (s) => s.agentsOnline,                     icon: PeopleOutlineOutlined, variant: 'success'  },
    { label: 'Active Calls',      value: (s) => s.activeCalls,                       icon: PhoneInTalkOutlined,   variant: 'info'     },
    { label: 'Agents Paused',     value: (s) => s.pausedAgents,                      icon: PauseCircleOutlined,   variant: 'warning'  },
    { label: 'Calls Today',       value: (s) => s.callsToday,                        icon: BarChartOutlined,      variant: 'neutral'  },
    { label: 'New Leads',         value: (s) => s.newLeads.toLocaleString(),          icon: QueueOutlined,         variant: 'info'     },
    { label: 'Avg Handle Time',   value: (s) => formatDuration(s.avgTalkSecToday),   icon: AccessTimeOutlined,    variant: 'warning'  },
  ],
  Agent: [
    { label: 'My Calls Today',    value: (s) => s.myCallsToday,                      icon: PhoneInTalkOutlined,   variant: 'info'     },
    { label: 'My Talk Time',      value: (s) => formatDuration(s.myTalkSecToday),    icon: AccessTimeOutlined,    variant: 'neutral'  },
    { label: 'Avg Handle Time',   value: (s) => formatDuration(s.myAvgTalkSecToday), icon: BarChartOutlined,      variant: 'warning'  },
    { label: 'Agents Online',     value: (s) => s.agentsOnline,                      icon: PeopleOutlineOutlined, variant: 'success'  },
    { label: 'Active Calls',      value: (s) => s.activeCalls,                       icon: PhoneInTalkOutlined,   variant: 'info'     },
  ],
};

export function Dashboard() {
  const { user } = useAuth();
  const role = user!.role;
  const { data: stats, loading, error } = useApiData(fetchDashboardStats);
  const kpiDefs = ROLE_KPIS[role];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        {greeting()}, {user!.displayName.split(' ')[0]}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Here's what's happening with your {role === 'Administrator' ? 'organization' : 'team'} right now.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {kpiDefs.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={kpi.label}>
            {loading || !stats ? (
              <Skeleton variant="rounded" height={100} />
            ) : (
              <KpiCard
                label={kpi.label}
                value={kpi.value(stats)}
                icon={kpi.icon}
                variant={kpi.variant}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
