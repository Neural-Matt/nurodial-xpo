import type { ElementType } from 'react';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import PeopleOutlineOutlined from '@mui/icons-material/PeopleOutlineOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import PhoneInTalkOutlined from '@mui/icons-material/PhoneInTalkOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import QueueOutlined from '@mui/icons-material/QueueOutlined';
import MonitorHeartOutlined from '@mui/icons-material/MonitorHeartOutlined';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import CallSplitOutlined from '@mui/icons-material/CallSplitOutlined';
import CallReceivedOutlined from '@mui/icons-material/CallReceivedOutlined';
import CallMadeOutlined from '@mui/icons-material/CallMadeOutlined';
import PsychologyOutlined from '@mui/icons-material/PsychologyOutlined';
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined';
import PhoneDisabledOutlined from '@mui/icons-material/PhoneDisabledOutlined';
import RemoveCircleOutlined from '@mui/icons-material/RemoveCircleOutlined';
import VoicemailOutlined from '@mui/icons-material/VoicemailOutlined';
import EventBusyOutlined from '@mui/icons-material/EventBusyOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import PhoneCallbackOutlined from '@mui/icons-material/PhoneCallbackOutlined';
import RecordVoiceOverOutlined from '@mui/icons-material/RecordVoiceOverOutlined';
import DialpadOutlined from '@mui/icons-material/DialpadOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import SettingsApplicationsOutlined from '@mui/icons-material/SettingsApplicationsOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import ToggleOnOutlined from '@mui/icons-material/ToggleOnOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import type { Role } from '../types';

export interface NavNode {
  id: string;
  label: string;
  icon: ElementType;
  path?: string;
  badge?: number;
  built?: boolean;
  /** Real (or closest-equivalent) VICIDial table/concept this module will integrate with. */
  vicidialMapping?: string;
  children?: NavNode[];
}

// Shared across all 3 roles as the post-login landing page, even though it
// isn't a named module in Administrator's/Agent's verbatim spec.
const dashboard: NavNode = { id: 'dashboard', label: 'Dashboard', icon: DashboardOutlined, path: '/dashboard', built: true };

export const navConfigByRole: Record<Role, NavNode[]> = {
  Administrator: [
    dashboard,
    { id: 'admin-process', label: 'Process', icon: AccountTreeOutlined, path: '/admin/process', built: true, vicidialMapping: 'Custom workflow engine' },
    { id: 'admin-global-settings', label: 'Global Settings', icon: SettingsOutlined, path: '/admin/global-settings', built: true, vicidialMapping: 'vicidial_system_settings' },
    { id: 'admin-blended-campaign', label: 'Blended Campaign', icon: CampaignOutlined, path: '/admin/blended-campaign', built: true, vicidialMapping: 'vicidial_campaigns' },
    {
      id: 'admin-call-routing',
      label: 'Call Routing',
      icon: CallSplitOutlined,
      children: [
        { id: 'admin-call-routing-inbound', label: 'Inbound Routing', icon: CallReceivedOutlined, path: '/admin/call-routing/inbound', vicidialMapping: 'vicidial_inbound_groups' },
        { id: 'admin-call-routing-outbound', label: 'Outbound Routing', icon: CallMadeOutlined, path: '/admin/call-routing/outbound', vicidialMapping: 'vicidial_campaigns (outbound dial config)' },
        { id: 'admin-call-routing-queue', label: 'Queue Routing', icon: QueueOutlined, path: '/admin/call-routing/queue', vicidialMapping: 'vicidial_queues' },
        { id: 'admin-call-routing-skill', label: 'Skill-Based Routing', icon: PsychologyOutlined, path: '/admin/call-routing/skill-based', vicidialMapping: 'vicidial_campaign_skills' },
        { id: 'admin-call-routing-time', label: 'Time-Based Routing', icon: ScheduleOutlined, path: '/admin/call-routing/time-based', vicidialMapping: 'vicidial_dial_time_check' },
      ],
    },
    { id: 'admin-dispositions', label: 'Dispositions', icon: AssignmentTurnedInOutlined, path: '/admin/dispositions', built: true, vicidialMapping: 'vicidial_statuses' },
    { id: 'admin-qa-parameters', label: 'QA Parameters', icon: FactCheckOutlined, path: '/admin/qa-parameters', vicidialMapping: 'Custom QA scorecard schema' },
    { id: 'admin-skills', label: 'Skills', icon: PsychologyOutlined, path: '/admin/skills', vicidialMapping: 'vicidial_campaign_skills' },
    { id: 'admin-dnc', label: 'DNC', icon: PhoneDisabledOutlined, path: '/admin/dnc', vicidialMapping: 'vicidial_dnc_list' },
    { id: 'admin-blacklisting', label: 'Blacklisting', icon: RemoveCircleOutlined, path: '/admin/blacklisting', vicidialMapping: 'vicidial_blacklist_data' },
    { id: 'admin-voicemail', label: 'Voice Mail', icon: VoicemailOutlined, path: '/admin/voicemail', vicidialMapping: 'vicidial_voicemail_data' },
    { id: 'admin-holiday-office-hours', label: 'Holiday / Office Hours', icon: EventBusyOutlined, path: '/admin/holiday-office-hours', vicidialMapping: 'vicidial_holidays' },
    { id: 'admin-tables', label: 'Tables', icon: TableChartOutlined, path: '/admin/tables', vicidialMapping: 'vicidial_lists (lookup tables)' },
  ],
  Supervisor: [
    {
      id: 'sup-monitor',
      label: 'Monitor',
      icon: MonitorHeartOutlined,
      children: [
        { id: 'sup-monitor-live', label: 'Live Monitoring', icon: MonitorHeartOutlined, path: '/supervisor/monitor/live', built: true, vicidialMapping: 'vicidial_live_agents' },
        dashboard,
        { id: 'sup-monitor-leads', label: 'Leads Monitoring', icon: VisibilityOutlined, path: '/supervisor/monitor/leads', vicidialMapping: 'vicidial_list / vicidial_lead' },
        { id: 'sup-monitor-agents', label: 'Agent Monitoring', icon: SupportAgentOutlined, path: '/supervisor/monitor/agents', built: true, vicidialMapping: 'vicidial_agent_log' },
      ],
    },
    {
      id: 'sup-manage',
      label: 'Manage',
      icon: ManageAccountsOutlined,
      children: [
        { id: 'sup-manage-call-details', label: 'Call Details', icon: PhoneInTalkOutlined, path: '/supervisor/manage/call-details', vicidialMapping: 'vicidial_log / vicidial_closer_log' },
        { id: 'sup-manage-users', label: 'Users', icon: PeopleOutlineOutlined, path: '/supervisor/manage/users', built: true, vicidialMapping: 'vicidial_users' },
        { id: 'sup-manage-leads', label: 'Leads Management', icon: ListAltOutlined, path: '/supervisor/manage/leads', built: true, vicidialMapping: 'vicidial_list / vicidial_lead' },
        { id: 'sup-manage-callback', label: 'Callback', icon: PhoneCallbackOutlined, path: '/supervisor/manage/callback', vicidialMapping: 'vicidial_callbacks' },
        { id: 'sup-manage-prompt', label: 'Prompt', icon: RecordVoiceOverOutlined, path: '/supervisor/manage/prompt', vicidialMapping: 'vicidial_scripts' },
        { id: 'sup-manage-dialer-settings', label: 'Dialer Settings', icon: DialpadOutlined, path: '/supervisor/manage/dialer-settings', vicidialMapping: 'vicidial_campaigns (dialer config)' },
        { id: 'sup-manage-holiday-office-hours', label: 'Holiday / Office Hours', icon: EventBusyOutlined, path: '/supervisor/manage/holiday-office-hours', vicidialMapping: 'vicidial_holidays' },
      ],
    },
    { id: 'sup-workbench', label: 'Workbench', icon: BuildOutlined, path: '/supervisor/workbench', vicidialMapping: 'Custom operational workspace' },
    {
      id: 'sup-reports',
      label: 'Reports',
      icon: AssessmentOutlined,
      children: [
        { id: 'sup-reports-list', label: 'Report List', icon: AssessmentOutlined, path: '/supervisor/reports/list', built: true, vicidialMapping: 'vicidial_reports' },
        { id: 'sup-reports-templates', label: 'Template List', icon: ArticleOutlined, path: '/supervisor/reports/templates', vicidialMapping: 'Custom report templates' },
      ],
    },
    { id: 'sup-control-panel', label: 'Control Panel', icon: SettingsApplicationsOutlined, path: '/supervisor/control-panel', vicidialMapping: 'vicidial_campaigns / vicidial_queues (live control)' },
  ],
  Agent: [
    {
      id: 'agent-home',
      label: 'Home',
      icon: HomeOutlined,
      children: [
        { id: 'agent-home-knowledge-base', label: 'Knowledge Base', icon: MenuBookOutlined, path: '/agent/home/knowledge-base', vicidialMapping: 'Custom knowledge base' },
        { id: 'agent-home-dialer', label: 'Dialer', icon: DialpadOutlined, path: '/agent/home/dialer', built: true, vicidialMapping: 'vicidial_live_agents (agent API)' },
        { id: 'agent-home-campaign-selection', label: 'Campaign Selection', icon: CampaignOutlined, path: '/agent/home/campaign-selection', built: true, vicidialMapping: 'vicidial_campaigns' },
        { id: 'agent-home-availability', label: 'Availability Toggle', icon: ToggleOnOutlined, path: '/agent/home/availability', built: true, vicidialMapping: 'vicidial_agent_log (status)' },
        { id: 'agent-home-callback', label: 'Callback', icon: PhoneCallbackOutlined, path: '/agent/home/callback', vicidialMapping: 'vicidial_callbacks' },
      ],
    },
    {
      id: 'agent-call-details',
      label: 'Call Details',
      icon: PhoneInTalkOutlined,
      children: [
        { id: 'agent-call-details-disposition', label: 'Disposition Description', icon: AssignmentTurnedInOutlined, path: '/agent/call-details/disposition-description', vicidialMapping: 'vicidial_statuses' },
        { id: 'agent-call-details-report', label: 'Report', icon: AssessmentOutlined, path: '/agent/call-details/report', vicidialMapping: 'vicidial_log (agent-scoped)' },
        { id: 'agent-call-details-script', label: 'Script', icon: DescriptionOutlined, path: '/agent/call-details/script', vicidialMapping: 'vicidial_scripts' },
      ],
    },
    dashboard,
  ],
};

export function flattenNavNodes(nodes: NavNode[]): NavNode[] {
  return nodes.flatMap((node) => (node.children ? flattenNavNodes(node.children) : [node]));
}

export function allNavLeaves(): NavNode[] {
  return Object.values(navConfigByRole).flatMap(flattenNavNodes);
}

export function navPathsForRole(role: Role): Set<string> {
  return new Set(
    flattenNavNodes(navConfigByRole[role])
      .map((node) => node.path)
      .filter((path): path is string => Boolean(path)),
  );
}
