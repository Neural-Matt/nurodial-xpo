import type { Role } from '../types';

// Single seam for the post-login redirect target. Currently identical for all
// 3 roles, but kept as a per-role lookup so a role-specific landing page later
// is a one-line change here, not a grep-and-replace.
const LANDING_PATHS: Record<Role, string> = {
  Administrator: '/dashboard',
  Supervisor: '/dashboard',
  Agent: '/dashboard',
};

export function landingPathForRole(role: Role): string {
  return LANDING_PATHS[role];
}
