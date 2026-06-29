import type { AppUser, PermissionItem } from '../../types/domain';

export const userKpis = {
  total: 128,
  active: 98,
  inactive: 12,
  locked: 8,
};

export const users: AppUser[] = [
  { id: 1, name: 'Admin User', email: 'admin@nurodial.com', role: 'Administrator', team: 'System', status: 'Active', lastLogin: 'May 20, 2025 10:30 AM', isCurrentUser: true },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@nurodial.com', role: 'Supervisor', team: 'Sales Campaign', status: 'Active', lastLogin: 'May 20, 2025 09:15 AM' },
  { id: 3, name: 'Michael Johnson', email: 'michael.johnson@nurodial.com', role: 'Agent', team: 'Sales Campaign', status: 'Active', lastLogin: 'May 19, 2025 04:45 PM' },
  { id: 4, name: 'Brian Williams', email: 'brian.williams@nurodial.com', role: 'Agent', team: 'Support Queue', status: 'Active', lastLogin: 'May 19, 2025 02:20 PM' },
  { id: 5, name: 'Sarah Lee', email: 'sarah.lee@nurodial.com', role: 'QualityAssurance', team: 'Quality', status: 'Inactive', lastLogin: 'May 10, 2025 11:05 AM' },
  { id: 6, name: 'Emily Davis', email: 'emily.davis@nurodial.com', role: 'Agent', team: 'Sales Campaign', status: 'Active', lastLogin: 'May 20, 2025 08:55 AM' },
  { id: 7, name: 'Daniel Taylor', email: 'daniel.taylor@nurodial.com', role: 'Agent', team: 'Support Queue', status: 'Locked', lastLogin: 'May 05, 2025 01:30 PM' },
  { id: 8, name: 'Alex Carter', email: 'alex.carter@nurodial.com', role: 'CampaignManager', team: 'Campaigns', status: 'Active', lastLogin: 'May 18, 2025 10:10 AM' },
];

export const ROLE_LABELS: Record<string, string> = {
  Administrator: 'Administrator',
  Supervisor: 'Supervisor',
  Agent: 'Agent',
  QualityAssurance: 'Quality Assurance',
  CampaignManager: 'Campaign Manager',
};

export const ROLE_TONE: Record<string, 'primary' | 'error' | 'warning' | 'info' | 'success' | 'neutral'> = {
  Administrator: 'primary',
  Supervisor: 'info',
  Agent: 'warning',
  QualityAssurance: 'success',
  CampaignManager: 'neutral',
};

export function defaultPermissions(): PermissionItem[] {
  return [
    { id: 'dashboard-reports', label: 'Dashboard & Reports', description: 'View dashboards and call center reports', enabled: true },
    { id: 'campaigns', label: 'Campaigns', description: 'Create, configure and pause dialer campaigns', enabled: true },
    { id: 'leads', label: 'Leads', description: 'View, import and edit lead lists', enabled: true },
    { id: 'live-monitoring', label: 'Live Monitoring', description: 'Monitor live calls and agent status', enabled: true },
    { id: 'qa-evaluations', label: 'QA Evaluations', description: 'Score and review recorded calls', enabled: false },
    { id: 'automation', label: 'Automation', description: 'Build and edit call routing workflows', enabled: false },
    { id: 'settings', label: 'Settings', description: 'Access system and integration settings', enabled: false },
    { id: 'users-security', label: 'Users & Security', description: 'Manage users and security settings', enabled: false },
  ];
}

export const activityLog = [
  'Logged in — May 20, 2025 10:30 AM',
  'Updated profile details — May 18, 2025 03:12 PM',
  'Changed password — May 12, 2025 09:05 AM',
];
