import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Tabs, Tab, Switch,
  Stack, Divider, Menu, MenuItem,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ZoomInOutlined from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlined from '@mui/icons-material/ZoomOutOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import SmsOutlined from '@mui/icons-material/SmsOutlined';
import UpdateOutlined from '@mui/icons-material/UpdateOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import HandshakeOutlined from '@mui/icons-material/HandshakeOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { WorkflowCanvas } from '../../components/common/WorkflowCanvas';
import {
  workflowNodes, workflowEdges, activeTriggers as initialTriggers, automationLogs,
} from '../../services/mock/automation';
import type { ActiveTrigger } from '../../services/mock/automation';

const TOOL_PALETTE = [
  { label: 'Trigger', icon: BoltOutlined },
  { label: 'Condition', icon: FilterAltOutlined },
  { label: 'Action', icon: AssignmentOutlined },
  { label: 'Delay', icon: AccessTimeOutlined },
  { label: 'Email', icon: EmailOutlined },
  { label: 'SMS', icon: SmsOutlined },
  { label: 'Update', icon: UpdateOutlined },
  { label: 'End', icon: FlagOutlined },
];

const TRIGGER_ICONS: Record<ActiveTrigger['icon'], typeof PhoneOutlined> = {
  phone: PhoneOutlined,
  personAdd: PersonAddOutlined,
  email: EmailOutlined,
  deal: HandshakeOutlined,
  task: TaskAltOutlined,
};

const LOG_STATUS_ICON = {
  success: { icon: CheckCircleOutlined, color: 'success.main' as const },
  error: { icon: ErrorOutlined, color: 'error.main' as const },
  warning: { icon: WarningAmberOutlined, color: 'warning.main' as const },
};

const TABS = ['Workflow Builder', 'Active Workflows', 'Templates', 'Workflow Logs'];

export function AutomationWorkflow() {
  const [tab, setTab] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [triggers, setTriggers] = useState(initialTriggers);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const toggleTrigger = (id: string) =>
    setTriggers((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));

  return (
    <Box>
      <PageHeader
        title="Automation & Workflow"
        subtitle="Build powerful workflows to automate your business processes."
        actions={
          <>
            <Button variant="outlined" startIcon={<UploadFileOutlined />}>Import Workflow</Button>
            <Button variant="contained" startIcon={<AddOutlined />}>New Workflow</Button>
          </>
        }
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((label) => <Tab key={label} label={label} />)}
      </Tabs>

      {tab !== 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
              No {TABS[tab].toLowerCase()} to show yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 9 }} sx={{ minWidth: 0 }}>
            <Card>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Call Routing & Follow-up</Typography>
                    <StatusBadge label="Active" />
                    <IconButton size="small"><EditOutlined fontSize="small" /></IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(1)))}>
                      <ZoomOutOutlined fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 42, textAlign: 'center' }}>{Math.round(zoom * 100)}%</Typography>
                    <IconButton size="small" onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(1)))}>
                      <ZoomInOutlined fontSize="small" />
                    </IconButton>
                    <Button size="small" variant="outlined" startIcon={<SaveOutlined fontSize="small" />}>Save</Button>
                    <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}><MoreVertOutlined fontSize="small" /></IconButton>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Stack spacing={1} sx={{ pt: 1 }}>
                    {TOOL_PALETTE.map(({ label, icon: Icon }) => (
                      <Stack key={label} spacing={0.25} sx={{ alignItems: 'center', width: 56 }}>
                        <IconButton size="small" sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1.5 }}>
                          <Icon fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <WorkflowCanvas nodes={workflowNodes} edges={workflowEdges} zoom={zoom} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Active Triggers</Typography>
                  <Button size="small">View All</Button>
                </Stack>
                <Stack divider={<Divider />} spacing={1.5}>
                  {triggers.map((trigger) => {
                    const Icon = TRIGGER_ICONS[trigger.icon];
                    return (
                      <Stack key={trigger.id} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', py: 0.5 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(224,32,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon sx={{ fontSize: 16, color: 'primary.main' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{trigger.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{trigger.description}</Typography>
                        </Box>
                        <Switch size="small" checked={trigger.enabled} onChange={() => toggleTrigger(trigger.id)} />
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Automation Logs</Typography>
                  <Button size="small">View All</Button>
                </Stack>
                <Stack divider={<Divider />} spacing={1.5}>
                  {automationLogs.map((log) => {
                    const { icon: Icon, color } = LOG_STATUS_ICON[log.status];
                    return (
                      <Stack key={log.id} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', py: 0.5 }}>
                        <Icon sx={{ fontSize: 18, color, mt: 0.25 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.workflow}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{log.result}</Typography>
                          <Typography variant="caption" color="text.disabled">{log.time}</Typography>
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button size="small">View All Logs</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => setMenuAnchor(null)}>Duplicate</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>Export</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>
    </Box>
  );
}
