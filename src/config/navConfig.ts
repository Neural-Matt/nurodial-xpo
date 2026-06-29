import type { ElementType } from 'react';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import ViewModuleOutlined from '@mui/icons-material/ViewModuleOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import ExtensionOutlined from '@mui/icons-material/ExtensionOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import StorageOutlined from '@mui/icons-material/StorageOutlined';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import ApartmentOutlined from '@mui/icons-material/ApartmentOutlined';
import ContactsOutlined from '@mui/icons-material/ContactsOutlined';
import HandshakeOutlined from '@mui/icons-material/HandshakeOutlined';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import PendingActionsOutlined from '@mui/icons-material/PendingActionsOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import NotificationsActiveOutlined from '@mui/icons-material/NotificationsActiveOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import QueueOutlined from '@mui/icons-material/QueueOutlined';
import MonitorHeartOutlined from '@mui/icons-material/MonitorHeartOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
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

export const navConfigByRole: Record<Role, NavNode[]> = {
  Administrator: [
    dashboard,
    { id: 'admin-users', label: 'Users', icon: PeopleOutlineOutlined, path: '/admin/users', built: true },
    { id: 'admin-teams-roles', label: 'Teams & Roles', icon: GroupsOutlined, path: '/admin/teams-roles' },
    {
      id: 'admin-data-reports',
      label: 'Data & Reports',
      icon: AssessmentOutlined,
      children: [
        { id: 'admin-analytics', label: 'Analytics Dashboard', icon: InsightsOutlined, path: '/admin/analytics', built: true },
        { id: 'admin-user-reports', label: 'User Reports', icon: DescriptionOutlined, path: '/admin/reports/users' },
        { id: 'admin-activity-logs', label: 'Activity Logs', icon: ListAltOutlined, path: '/admin/reports/activity-logs' },
        { id: 'admin-data-exports', label: 'Data Exports', icon: FileDownloadOutlined, path: '/admin/reports/data-exports' },
      ],
    },
    { id: 'admin-accounts', label: 'Accounts', icon: ApartmentOutlined, path: '/admin/accounts' },
    { id: 'admin-contacts', label: 'Contacts', icon: ContactsOutlined, path: '/admin/contacts' },
    { id: 'admin-deals', label: 'Deals', icon: HandshakeOutlined, path: '/admin/deals' },
    { id: 'admin-activities', label: 'Activities', icon: EventNoteOutlined, path: '/admin/activities' },
    { id: 'admin-marketing', label: 'Marketing', icon: CampaignOutlined, path: '/admin/marketing' },
    {
      id: 'admin-settings',
      label: 'Settings',
      icon: SettingsOutlined,
      children: [
        { id: 'admin-security', label: 'Security', icon: ShieldOutlined, path: '/admin/settings/security' },
        { id: 'admin-system-settings', label: 'System Settings', icon: SettingsOutlined, path: '/admin/settings/system' },
        { id: 'admin-modules-fields', label: 'Modules & Fields', icon: ViewModuleOutlined, path: '/admin/settings/modules-fields' },
        { id: 'admin-data-management', label: 'Data Management', icon: StorageOutlined, path: '/admin/settings/data-management' },
        { id: 'admin-support-settings', label: 'Support Settings', icon: SupportAgentOutlined, path: '/admin/settings/support' },
      ],
    },
    { id: 'admin-integrations', label: 'Integrations', icon: ExtensionOutlined, path: '/settings/integration', built: true },
    { id: 'admin-automation', label: 'Automation', icon: BoltOutlined, path: '/admin/automation', built: true },
    { id: 'admin-audit-logs', label: 'Audit Logs', icon: HistoryOutlined, path: '/admin/audit-logs' },
    { id: 'admin-billing', label: 'Billing & Subscription', icon: CreditCardOutlined, path: '/admin/billing', built: true },
  ],
  QualityAssurance: [
    dashboard,
    { id: 'qa-call-evaluations', label: 'Call Evaluations', icon: PhoneInTalkOutlined, path: '/qa/evaluation', built: true },
    { id: 'qa-evaluations-queue', label: 'Evaluations Queue', icon: PendingActionsOutlined, path: '/qa/evaluations-queue', badge: 12 },
    { id: 'qa-calibration', label: 'Calibration', icon: TuneOutlined, path: '/qa/calibration' },
    { id: 'qa-scorecards', label: 'Scorecards', icon: AssignmentTurnedInOutlined, path: '/qa/scorecards' },
    { id: 'qa-reports', label: 'Reports', icon: AssessmentOutlined, path: '/qa/reports' },
    { id: 'qa-analytics', label: 'Analytics', icon: InsightsOutlined, path: '/qa/analytics' },
    { id: 'qa-users', label: 'Users', icon: PeopleOutlineOutlined, path: '/qa/users' },
    { id: 'qa-teams', label: 'Teams', icon: GroupsOutlined, path: '/qa/teams' },
    { id: 'qa-forms-templates', label: 'Forms & Templates', icon: ArticleOutlined, path: '/qa/forms-templates' },
    { id: 'qa-disputes', label: 'Disputes', icon: ReportProblemOutlined, path: '/qa/disputes', badge: 3 },
    { id: 'qa-alerts', label: 'Alerts', icon: NotificationsActiveOutlined, path: '/qa/alerts' },
    { id: 'qa-settings', label: 'Settings', icon: SettingsOutlined, path: '/qa/settings' },
    { id: 'qa-integration', label: 'Integration', icon: ExtensionOutlined, path: '/qa/integration' },
    { id: 'qa-audit-logs', label: 'Audit Logs', icon: HistoryOutlined, path: '/qa/audit-logs' },
  ],
  Agent: [
    dashboard,
    { id: 'agent-active-interaction', label: 'Active Interaction', icon: SupportAgentOutlined, path: '/agent/interaction', built: true },
    { id: 'agent-interactions', label: 'Interactions', icon: ForumOutlined, path: '/agent/interactions' },
    { id: 'agent-contacts', label: 'Contacts', icon: ContactsOutlined, path: '/agent/contacts' },
    { id: 'agent-accounts', label: 'Accounts', icon: ApartmentOutlined, path: '/agent/accounts' },
    { id: 'agent-deals', label: 'Deals', icon: HandshakeOutlined, path: '/agent/deals' },
    { id: 'agent-tasks', label: 'Tasks', icon: TaskAltOutlined, path: '/agent/tasks' },
    { id: 'agent-calendar', label: 'Calendar', icon: CalendarMonthOutlined, path: '/agent/calendar' },
    { id: 'agent-knowledge-base', label: 'Knowledge Base', icon: MenuBookOutlined, path: '/agent/knowledge-base' },
    { id: 'agent-reports', label: 'Reports', icon: AssessmentOutlined, path: '/agent/reports' },
    { id: 'agent-queues', label: 'Queues', icon: QueueOutlined, path: '/agent/queues' },
    { id: 'agent-settings', label: 'Settings', icon: SettingsOutlined, path: '/agent/settings' },
  ],
  Supervisor: [
    dashboard,
    { id: 'sup-live-monitoring', label: 'Live Monitoring', icon: MonitorHeartOutlined, path: '/supervisor/live', built: true },
    { id: 'sup-call-queues', label: 'Call Queues', icon: QueueOutlined, path: '/supervisor/call-queues' },
    { id: 'sup-agents', label: 'Agents', icon: PeopleOutlineOutlined, path: '/supervisor/agents' },
    { id: 'sup-teams', label: 'Teams', icon: GroupsOutlined, path: '/supervisor/teams' },
    { id: 'sup-performance', label: 'Performance', icon: TrendingUpOutlined, path: '/supervisor/performance' },
    {
      id: 'sup-call-analytics',
      label: 'Call Analytics',
      icon: InsightsOutlined,
      children: [
        { id: 'sup-call-analytics-overview', label: 'Overview', icon: InsightsOutlined, path: '/supervisor/call-analytics/overview' },
        { id: 'sup-call-analytics-trends', label: 'Trends', icon: TrendingUpOutlined, path: '/supervisor/call-analytics/trends' },
      ],
    },
    {
      id: 'sup-reports',
      label: 'Reports',
      icon: AssessmentOutlined,
      children: [
        { id: 'sup-reports-team', label: 'Team Reports', icon: AssessmentOutlined, path: '/supervisor/reports/team' },
        { id: 'sup-reports-export', label: 'Export Reports', icon: FileDownloadOutlined, path: '/supervisor/reports/export' },
      ],
    },
    { id: 'sup-alerts-notifications', label: 'Alerts & Notifications', icon: NotificationsActiveOutlined, path: '/supervisor/alerts' },
    {
      id: 'sup-quality-management',
      label: 'Quality Management',
      icon: VerifiedOutlined,
      children: [
        { id: 'sup-qm-evaluations', label: 'Evaluations', icon: PhoneInTalkOutlined, path: '/supervisor/quality/evaluations' },
        { id: 'sup-qm-scorecards', label: 'Scorecards', icon: AssignmentTurnedInOutlined, path: '/supervisor/quality/scorecards' },
      ],
    },
    {
      id: 'sup-workforce-management',
      label: 'Workforce Management',
      icon: ScheduleOutlined,
      children: [
        { id: 'sup-wfm-scheduling', label: 'Scheduling', icon: CalendarMonthOutlined, path: '/supervisor/workforce/scheduling' },
        { id: 'sup-wfm-adherence', label: 'Adherence', icon: TaskAltOutlined, path: '/supervisor/workforce/adherence' },
      ],
    },
    { id: 'sup-settings', label: 'Settings', icon: SettingsOutlined, path: '/supervisor/settings' },
    { id: 'sup-integrations', label: 'Integrations', icon: ExtensionOutlined, path: '/supervisor/integrations' },
    { id: 'sup-audit-logs', label: 'Audit Logs', icon: HistoryOutlined, path: '/supervisor/audit-logs' },
  ],
  MIS: [
    dashboard,
    { id: 'mis-analytics', label: 'Analytics Dashboard', icon: InsightsOutlined, path: '/mis/analytics', built: true },
    { id: 'mis-reports', label: 'Reports', icon: AssessmentOutlined, path: '/mis/reports' },
    { id: 'mis-data-exports', label: 'Data Exports', icon: FileDownloadOutlined, path: '/mis/data-exports' },
    { id: 'mis-audit-logs', label: 'Audit Logs', icon: HistoryOutlined, path: '/mis/audit-logs' },
    { id: 'mis-settings', label: 'Settings', icon: SettingsOutlined, path: '/mis/settings' },
  ],
  CampaignManager: [
    dashboard,
    { id: 'cm-campaigns', label: 'Campaigns', icon: CampaignOutlined, path: '/campaigns/list' },
    { id: 'cm-lead-lists', label: 'Lead Lists', icon: ListAltOutlined, path: '/campaigns/leads' },
    { id: 'cm-dispositions', label: 'Dispositions', icon: AssignmentTurnedInOutlined, path: '/campaigns/dispositions' },
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
