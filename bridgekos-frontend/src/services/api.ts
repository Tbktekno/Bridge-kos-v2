import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';
import { DUMMY_KENDARI_BOARDING_HOUSES, DUMMY_ROOM_SUMMARIES } from '@/mocks/dummyData';

const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1';
const isMockEnabled = import.meta.env.VITE_USE_MOCK === 'true';

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

// Mock Interceptor for Vercel Frontend Standalone Demo Mode
if (isMockEnabled) {
  api.interceptors.request.use(async (config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    // Small simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Handle /boarding-houses
    if (url.includes('/boarding-houses')) {
      if (url.includes('/owner/me')) {
        return {
          ...config,
          adapter: async () => ({
            data: {
              success: true,
              message: 'Mock list mine success',
              data: {
                items: DUMMY_KENDARI_BOARDING_HOUSES,
                pagination: { page: 1, limit: 10, totalItems: DUMMY_KENDARI_BOARDING_HOUSES.length, totalPages: 1 },
              },
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          }),
        };
      }

      const houseIdMatch = url.match(/\/boarding-houses\/([a-zA-Z0-9-]+)(\/contact|\/owner)?$/);
      if (houseIdMatch) {
        const id = houseIdMatch[1];
        const sub = houseIdMatch[2];
        const house = DUMMY_KENDARI_BOARDING_HOUSES.find((h) => h.id === id || h.slug === id) ?? DUMMY_KENDARI_BOARDING_HOUSES[0];

        if (sub === '/contact') {
          return {
            ...config,
            adapter: async () => ({
              data: {
                success: true,
                message: 'Mock contact',
                data: {
                  waLink: `https://wa.me/${house.owner?.phone || '6281245678901'}?text=Halo%20saya%20tertarik%20dengan%20${encodeURIComponent(house.name)}`,
                  phone: house.owner?.phone || '081245678901',
                },
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
            }),
          };
        }

        return {
          ...config,
          adapter: async () => ({
            data: {
              success: true,
              message: 'Mock detail success',
              data: house,
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          }),
        };
      }

      // Default GET /boarding-houses
      return {
        ...config,
        adapter: async () => ({
          data: {
            success: true,
            message: 'Mock list success',
            data: {
              items: DUMMY_KENDARI_BOARDING_HOUSES,
              pagination: { page: 1, limit: 10, totalItems: DUMMY_KENDARI_BOARDING_HOUSES.length, totalPages: 1 },
            },
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }),
      };
    }

    // Handle /rooms
    if (url.includes('/rooms')) {
      return {
        ...config,
        adapter: async () => ({
          data: {
            success: true,
            message: 'Mock rooms success',
            data: DUMMY_ROOM_SUMMARIES,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }),
      };
    }

    // Handle /auth
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return {
        ...config,
        adapter: async () => ({
          data: {
            success: true,
            message: 'Mock login success',
            data: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              user: {
                id: 'usr-1',
                email: 'demo@bridgekos.com',
                fullName: 'Demo User Kendari',
                role: 'OWNER',
                phone: '081245678901',
              },
            },
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }),
      };
    }

    if (url.includes('/auth/me') || url.includes('/users/me')) {
      return {
        ...config,
        adapter: async () => ({
          data: {
            success: true,
            message: 'Mock profile success',
            data: {
              id: 'usr-1',
              email: 'demo@bridgekos.com',
              fullName: 'Demo User Kendari',
              role: 'OWNER',
              phone: '081245678901',
              isVerified: true,
            },
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }),
      };
    }

    // Fallback generic mock response for POST/PUT/PATCH/DELETE & other GET endpoints
    return {
      ...config,
      adapter: async () => ({
        data: {
          success: true,
          message: 'Mock operation success',
          data: method === 'get' ? [] : { id: 'mock-id-123' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
    };
  });
}

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
      const state = useAuthStore.getState();
      // Guest requests (no token attached) hitting a protected endpoint must
      // NOT force a redirect to /login — they are simply unauthorized.
      if (!state.accessToken && !state.refreshToken) {
        return Promise.reject(error);
      }

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
