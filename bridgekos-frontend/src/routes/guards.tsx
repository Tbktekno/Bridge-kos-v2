import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import type { Role } from '@/types/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
}

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user || !roles.includes(user.role)) {
    const fallback = user?.role === 'OWNER' ? '/owner' : user?.role === 'ADMIN' ? '/admin' : '/tenant';
    return <Navigate to={fallback} replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated) {
    const home = user?.role === 'OWNER' ? '/owner' : user?.role === 'ADMIN' ? '/admin' : '/tenant';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}