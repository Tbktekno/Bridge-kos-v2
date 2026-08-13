import { api } from '@/services/api';
import type { AuthResult, AuthUser } from '@/types/auth';
import type { UserProfile } from '@/types/auth';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'OWNER' | 'TENANT';
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const { data } = await api.post<ApiEnvelope<AuthResult>>('/auth/register', {
      ...input,
      role: input.role ?? 'OWNER',
    });
    return data.data;
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const { data } = await api.post<ApiEnvelope<AuthResult>>('/auth/login', input);
    return data.data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<ApiEnvelope<AuthUser>>('/auth/me');
    return data.data;
  },

  async logout(refreshToken?: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<ApiEnvelope<{ message?: string }>>('/auth/forgot-password', {
      email,
    });
    return data.message;
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export const userApi = {
  async getMe(): Promise<UserProfile> {
    const { data } = await api.get<ApiEnvelope<UserProfile>>('/users/me');
    return data.data;
  },

  async updateMe(payload: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await api.patch<ApiEnvelope<UserProfile>>('/users/me', payload);
    return data.data;
  },
};
