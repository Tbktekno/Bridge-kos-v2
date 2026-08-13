import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, userApi, type RegisterInput, type LoginInput } from '@/services/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { QUERY_KEYS } from '@/constants/app';
import type { AuthUser } from '@/types/auth';

export function useAuthUser() {
  return useQuery({
    queryKey: [QUERY_KEYS.auth.me],
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch {
        useAuthStore.getState().logout();
        return null;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (result) => {
      useAuthStore.getState().setAuth({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
      queryClient.setQueryData<AuthUser>([QUERY_KEYS.auth.me], result.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      return authApi.logout(refreshToken ?? undefined);
    },
    onSettled: () => {
      useAuthStore.getState().logout();
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof userApi.updateMe>[0]) => userApi.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.auth.me] });
    },
  });
}