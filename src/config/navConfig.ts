import type { ElementType } from 'react';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import ExtensionOutlined from '@mui/icons-material/ExtensionOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import PendingActionsOutlined from '@mui/icons-material/PendingActionsOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import NotificationsActiveOutlined from '@mui/icons-material/NotificationsActiveOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import QueueOutlined from '@mui/icons-material/QueueOutlined';
import MonitorHeartOutlined from '@mui/icons-material/MonitorHeartOutlined';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import type { Role } from '../types';

export interface NavNode {
  id: string;
  label: string;
  icon: ElementType;
  path?: string;
  badge?: number;
  built?: boolean;
  children?: NavNode[];
}

const dashboard: NavNode = { id: 'dashboard', label: 'Dashboard', icon: DashboardOutlined, path: '/dashboard', built: true };

// Campaigns/Leads/Dispositions are owned by the VICIDial campaign domain and
// shared verbatim between Administrator and CampaignManager (same path, same page).
const campaigns: NavNode = { id: 'campaigns', label: 'Campaigns', icon: CampaignOutlined, path: '/campaigns/list', built: true };
const leadLists: NavNode = { id: 'lead-lists', label: 'Lead Lists', icon: ListAltOutlined, path: '/campaigns/leads', built: true };
const dispositions: NavNode = { id: 'dispositions', label: 'Dispositions', icon: AssignmentTurnedInOutlined, path: '/campaigns/dispositions', built: true };

export const navConfigByRole: Record<Role, NavNode[]> = {
  Administrator: [
    dashboard,
    { id: 'admin-agents', label: 'Agents', icon: PeopleOutlineOutlined, path: '/admin/users', built: true },
    campaigns,
    leadLists,
    dispositions,
    { id: 'admin-teams-roles', label: 'Teams & User Groups', icon: GroupsOutlined, path: '/admin/teams-roles' },
    { id: 'admin-analytics', label: 'Analytics', icon: InsightsOutlined, path: '/admin/analytics', built: true },
    { id: 'admin-automation', label: 'Automation', icon: BoltOutlined, path: '/admin/automation', built: true },
    { id: 'admin-integrations', label: 'Integrations', icon: ExtensionOutlined, path: '/settings/integration', built: true },
    { id: 'admin-audit-logs', label: 'Audit Logs', icon: HistoryOutlined, path: '/admin/audit-logs' },
    { id: 'admin-settings', label: 'Settings', icon: SettingsOutlined, path: '/admin/settings' },
  ],
  QualityAssurance: [
    dashboard,
    { id: 'qa-call-evaluations', label: 'Call Evaluations', icon: PhoneInTalkOutlined, path: '/qa/evaluation', built: true },
    { id: 'qa-evaluations-queue', label: 'Evaluations Queue', icon: PendingActionsOutlined, path: '/qa/evaluations-queue', badge: 12 },
    { id: 'qa-calibration', label: 'Calibration', icon: TuneOutlined, path: '/qa/calibration' },
    { id: 'qa-scorecards', label: 'Scorecards', icon: AssignmentTurnedInOutlined, path: '/qa/scorecards' },
    { id: 'qa-disputes', label: 'Disputes', icon: ReportProblemOutlined, path: '/qa/disputes', badge: 3 },
    { id: 'qa-reports', label: 'Reports', icon: AssessmentOutlined, path: '/qa/reports' },
    { id: 'qa-alerts', label: 'Alerts', icon: NotificationsActiveOutlined, path: '/qa/alerts' },
  ],
  Agent: [
    dashboard,
    { id: 'agent-active-interaction', label: 'Active Interaction', icon: SupportAgentOutlined, path: '/agent/interaction', built: true },
    { id: 'agent-interactions', label: 'Interactions', icon: ForumOutlined, path: '/agent/interactions' },
    { id: 'agent-knowledge-base', label: 'Knowledge Base', icon: MenuBookOutlined, path: '/agent/knowledge-base' },
    { id: 'agent-queues', label: 'Queues', icon: QueueOutlined, path: '/agent/queues' },
    { id: 'agent-settings', label: 'Settings', icon: SettingsOutlined, path: '/agent/settings' },
  ],
  Supervisor: [
    dashboard,
    { id: 'sup-live-monitoring', label: 'Live Monitoring', icon: MonitorHeartOutlined, path: '/supervisor/live', built: true },
    { id: 'sup-call-queues', label: 'Call Queues', icon: QueueOutlined, path: '/supervisor/call-queues', built: true },
    { id: 'sup-agents', label: 'Agents', icon: PeopleOutlineOutlined, path: '/supervisor/agents' },
    { id: 'sup-reports', label: 'Reports', icon: AssessmentOutlined, path: '/supervisor/reports' },
    { id: 'sup-workforce-management', label: 'Workforce Management', icon: ScheduleOutlined, path: '/supervisor/workforce' },
    { id: 'sup-alerts-notifications', label: 'Alerts & Notifications', icon: NotificationsActiveOutlined, path: '/supervisor/alerts' },
  ],
  CampaignManager: [
    dashboard,
    campaigns,
    leadLists,
    dispositions,
    { id: 'cm-reports', label: 'Reports', icon: AssessmentOutlined, path: '/campaigns/reports' },
    { id: 'cm-settings', label: 'Settings', icon: SettingsOutlined, path: '/campaigns/settings' },
  ],
};

export function flattenNavNodes(nodes: NavNode[]): NavNode[] {
  return nodes.flatMap((node) => (node.children ? flattenNavNodes(node.children) : [node]));
}

export function allNavLeaves(): NavNode[] {
  return Object.values(navConfigByRole).flatMap(flattenNavNodes);
}
