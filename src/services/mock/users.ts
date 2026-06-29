import type { AppUser, PermissionItem } from '../../types/domain';

export const userKpis = {
  total: 128,
  active: 98,
  inactive: 12,
  locked: 8,
};

export const users: AppUser[] = [
  { id: 1, name: 'Admin User', email: 'admin@nurodial.com', role: 'Administrator', team: 'System', status: 'Active', lastLogin: 'May 20, 2025 10:30 AM', isCurrentUser: true },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@nurodial.com', role: 'Manager', team: 'Sales', status: 'Active', lastLogin: 'May 20, 2025 09:15 AM' },
  { id: 3, name: 'Michael Johnson', email: 'michael.johnson@nurodial.com', role: 'Sales Rep', team: 'Sales', status: 'Active', lastLogin: 'May 19, 2025 04:45 PM' },
  { id: 4, name: 'Brian Williams', email: 'brian.williams@nurodial.com', role: 'Support Agent', team: 'Support', status: 'Active', lastLogin: 'May 19, 2025 02:20 PM' },
  { id: 5, name: 'Sarah Lee', email: 'sarah.lee@nurodial.com', role: 'Marketing User', team: 'Marketing', status: 'Inactive', lastLogin: 'May 10, 2025 11:05 AM' },
  { id: 6, name: 'Emily Davis', email: 'emily.davis@nurodial.com', role: 'Sales Rep', team: 'Sales', status: 'Active', lastLogin: 'May 20, 2025 08:55 AM' },
  { id: 7, name: 'Daniel Taylor', email: 'daniel.taylor@nurodial.com', role: 'Support Agent', team: 'Support', status: 'Locked', lastLogin: 'May 05, 2025 01:30 PM' },
  { id: 8, name: 'Alex Carter', email: 'alex.carter@nurodial.com', role: 'Manager', team: 'Sales', status: 'Active', lastLogin: 'May 18, 2025 10:10 AM' },
];

export const ROLE_TONE: Record<string, 'primary' | 'error' | 'warning' | 'info'> = {
  Administrator: 'primary',
  Manager: 'error',
  'Sales Rep': 'warning',
  'Support Agent': 'info',
  'Marketing User': 'warning',
};

export function defaultPermissions(): PermissionItem[] {
  return [
    { id: 'dashboard-reports', label: 'Dashboard & Reports', description: 'View dashboards and reports', enabled: true },
    { id: 'accounts', label: 'Accounts', description: 'Create, view, edit and delete accounts', enabled: true },
    { id: 'contacts', label: 'Contacts', description: 'Create, view, edit and delete contacts', enabled: true },
    { id: 'deals', label: 'Deals', description: 'Create, view, edit and delete deals', enabled: true },
    { id: 'activities', label: 'Activities', description: 'Manage tasks, calls, meetings and emails', enabled: true },
    { id: 'marketing', label: 'Marketing', description: 'Access marketing tools and campaigns', enabled: false },
    { id: 'settings', label: 'Settings', description: 'Access system settings and configuration', enabled: false },
    { id: 'users-security', label: 'Users & Security', description: 'Manage users and security settings', enabled: false },
  ];
}

export const activityLog = [
  'Logged in — May 20, 2025 10:30 AM',
  'Updated profile details — May 18, 2025 03:12 PM',
  'Changed password — May 12, 2025 09:05 AM',
];
