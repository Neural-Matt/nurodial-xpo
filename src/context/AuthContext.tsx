import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { validateCredentials } from '../services/mock/accounts';
import { AuthContext, ROLE_DISPLAY_NAMES, readSession, writeSession, clearSession, type AuthUser, type AuthContextValue } from './authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSession());

  const login = useCallback(async (username: string, password: string) => {
    const account = validateCredentials(username, password);
    if (!account) {
      throw new Error('Invalid username or password.');
    }
    const nextUser: AuthUser = {
      id: account.user,
      username: account.user,
      displayName: account.full_name || ROLE_DISPLAY_NAMES[account.role],
      role: account.role,
    };
    writeSession(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
