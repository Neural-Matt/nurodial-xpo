// Shared UI-domain types for NuroDial's mock data layer.
// Distinct from vicidial.ts, which models the future VICIDial integration.

import type { Role } from './index';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  team: string;
  status: 'Active' | 'Inactive' | 'Locked';
  lastLogin: string;
  isCurrentUser?: boolean;
}

export interface PermissionItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}
