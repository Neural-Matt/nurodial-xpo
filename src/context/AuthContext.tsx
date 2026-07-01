import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { validateCredentials } from '../services/mock/accounts';
import { apiLogin, isApiConfigured, TOKEN_KEY } from '../services/api/client';
import { AuthContext, ROLE_DISPLAY_NAMES, readSession, writeSession, clearSession, type AuthUser, type AuthContextValue } from './authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSession());

  const login = useCallback(async (username: string, password: string) => {
    if (isApiConfigured()) {
      const { token, user: apiUser } = await apiLogin(username, password);
      localStorage.setItem(TOKEN_KEY, token);
      writeSession(apiUser);
      setUser(apiUser);
      return apiUser;
    }
    // Mock fallback — only active when VITE_API_BASE_URL is not set
    const account = validateCredentials(username, password);
    if (!account) throw new Error('Invalid username or password.');
    const nextUser: AuthUser = {
      id: account.user,
      username: account.user,
      displayName: account.full_name || ROLE_DISPLAY_NAMES[account.role],
      role: account.role,
    };
    writeSession(nextUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
