import type { Role } from '../../types';

// Placeholder dev/test accounts only — swap for a real VICIDial auth call later.
// Field names (`user`, `pass`, `full_name`) intentionally mirror VICIDial's
// vicidial_users table so the future swap is a localized change, not a rewrite.
export interface AuthAccount {
  user: string;
  pass: string;
  full_name: string;
  role: Role;
}

export const accounts: AuthAccount[] = [
  { user: 'admin', pass: 'admin123', full_name: 'Admin User', role: 'Administrator' },
  { user: 'supervisor', pass: 'supervisor123', full_name: 'Supervisor User', role: 'Supervisor' },
  { user: 'agent', pass: 'agent123', full_name: 'Agent User', role: 'Agent' },
];

export function findAccountByUsername(username: string): AuthAccount | undefined {
  return accounts.find((account) => account.user.toLowerCase() === username.toLowerCase());
}

export function validateCredentials(username: string, password: string): AuthAccount | null {
  const account = findAccountByUsername(username);
  if (!account || account.pass !== password) return null;
  return account;
}
