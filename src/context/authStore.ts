import { createContext } from 'react';
import type { Role } from '../types';

export const AUTH_SESSION_KEY = 'nurodial.session';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
}

export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  Administrator: 'Admin User',
  Supervisor: 'Supervisor User',
  Agent: 'Agent User',
};

export const ROLE_LABELS: Record<Role, string> = {
  Administrator: 'Administrator',
  Supervisor: 'Supervisor',
  Agent: 'Agent',
};

export interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function readSession(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function writeSession(user: AuthUser): void {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
}
