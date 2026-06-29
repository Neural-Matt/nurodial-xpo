import { createContext } from 'react';
import type { Role } from '../types';

export const ALL_ROLES: Role[] = [
  'Administrator',
  'Agent',
  'Supervisor',
  'QualityAssurance',
  'CampaignManager',
];

export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  Administrator: 'Admin User',
  Agent: 'Agent User',
  Supervisor: 'Supervisor User',
  QualityAssurance: 'QA User',
  CampaignManager: 'Campaign Manager',
};

// Friendly label shown in the role switcher (vs. the raw Role union value)
export const ROLE_LABELS: Record<Role, string> = {
  Administrator: 'Administrator',
  Agent: 'Agent',
  Supervisor: 'Supervisor',
  QualityAssurance: 'Quality Assurance',
  CampaignManager: 'Campaign Manager',
};

export interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  roles: Role[];
  displayName: string;
}

export const RoleContext = createContext<RoleContextValue | undefined>(undefined);
