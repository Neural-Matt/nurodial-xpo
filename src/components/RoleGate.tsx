import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { navPathsForRole } from '../config/navConfig';
import { AccessDeniedPage } from './common/AccessDeniedPage';

// Rendered inside MainLayout (after ProtectedRoute already guarantees a user),
// so AccessDeniedPage shows up inside the normal sidebar/topbar chrome rather
// than as a bare full-page replacement.
export function RoleGate() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) return null;

  if (!navPathsForRole(user.role).has(pathname)) {
    return <AccessDeniedPage path={pathname} />;
  }

  return <Outlet />;
}
