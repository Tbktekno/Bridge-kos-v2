import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';

const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RefreshableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let pendingRequests: PendingRequest[] = [];

function resolveQueue(token: string): void {
  pendingRequests.forEach((pending) => pending.resolve(token));
  pendingRequests = [];
}

function rejectQueue(error: unknown): void {
  pendingRequests.forEach((pending) => pending.reject(error));
  pendingRequests = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    throw new AxiosError('No refresh token available');
  }
  const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  const data = response.data.data;
  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

api.interceptors.response.use(
  (response) => {
    const body = response?.data;
    if (
      body &&
      typeof body === 'object' &&
      Array.isArray((body as { data?: unknown }).data) &&
      (body as { meta?: unknown }).meta &&
      typeof (body as { meta?: unknown }).meta === 'object'
    ) {
      response.data = {
        ...body,
        data: {
          items: (body as { data: unknown }).data,
          pagination: (body as { meta: unknown }).meta,
        },
      };
      delete (response.data as Record<string, unknown>).meta;
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as RefreshableRequest | undefined;
    const isAuthEndpoint = original?.url?.includes('/auth/');
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const token = await refreshAccessToken();
        resolveQueue(token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        rejectQueue(refreshError);
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export { baseURL };
