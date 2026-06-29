import { useMemo, useState, type ReactNode } from 'react';
import type { Role } from '../types';
import { RoleContext, ALL_ROLES, ROLE_DISPLAY_NAMES, type RoleContextValue } from './roleStore';

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Administrator');

  const value = useMemo<RoleContextValue>(
    () => ({ role, setRole, roles: ALL_ROLES, displayName: ROLE_DISPLAY_NAMES[role] }),
    [role],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
