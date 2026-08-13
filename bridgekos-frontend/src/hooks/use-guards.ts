import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import type { Role } from '@/types/auth';

export function useRequireAuth() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
}

export function useRequireRole(roles: Role[]) {
  const navigate = useNavigate();
  const authed = useRequireAuth();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (authed && user && !roles.includes(user.role)) {
      const fallback =
        user.role === 'OWNER' ? '/owner' : user.role === 'ADMIN' ? '/admin' : '/tenant';
      navigate(fallback, { replace: true });
    }
  }, [authed, user, roles, navigate]);

  return authed && user !== null && roles.includes(user.role);
}