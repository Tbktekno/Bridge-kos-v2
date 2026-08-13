import { api } from '@/services/api';
import type {
  OwnerProfile,
  TenantProfile,
  BankAccount,
  SubscriptionPlan,
  SubscriptionSummary,
  SubscribeInput,
  OwnerAnalyticsOverview,
  AnalyticsSeriesPoint,
  AdminOverview,
} from '@/types/domain';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ownerApi = {
  async getMe(): Promise<OwnerProfile> {
    const { data } = await api.get<ApiEnvelope<OwnerProfile>>('/owners/me');
    return data.data;
  },

  async updateMe(payload: Partial<OwnerProfile>): Promise<OwnerProfile> {
    const { data } = await api.patch<ApiEnvelope<OwnerProfile>>('/owners/me', payload);
    return data.data;
  },

  async listBankAccounts(): Promise<BankAccount[]> {
    const { data } = await api.get<ApiEnvelope<BankAccount[]>>('/owners/me/bank-accounts');
    return data.data;
  },

  async addBankAccount(input: Omit<BankAccount, 'id'>): Promise<BankAccount> {
    const { data } = await api.post<ApiEnvelope<BankAccount>>('/owners/me/bank-accounts', input);
    return data.data;
  },

  async updateBankAccount(id: string, input: Partial<BankAccount>): Promise<BankAccount> {
    const { data } = await api.patch<ApiEnvelope<BankAccount>>(
      `/owners/me/bank-accounts/${id}`,
      input,
    );
    return data.data;
  },

  async removeBankAccount(id: string): Promise<void> {
    await api.delete(`/owners/me/bank-accounts/${id}`);
  },

  async submitVerification(input: {
    identityType?: string;
    identityNumber: string;
    identityImage?: string;
    imageUrl?: string;
  }): Promise<void> {
    await api.post('/owners/me/verification', input);
  },
};

export const tenantApi = {
  async getMe(): Promise<TenantProfile> {
    const { data } = await api.get<ApiEnvelope<TenantProfile>>('/tenants/me');
    return data.data;
  },

  async updateMe(payload: Partial<TenantProfile>): Promise<TenantProfile> {
    const { data } = await api.patch<ApiEnvelope<TenantProfile>>('/tenants/me', payload);
    return data.data;
  },
};

export const subscriptionApi = {
  async plans(): Promise<SubscriptionPlan[]> {
    const { data } = await api.get<ApiEnvelope<SubscriptionPlan[]>>('/subscriptions/plans');
    return data.data;
  },

  async subscribe(input: SubscribeInput): Promise<SubscriptionSummary> {
    const { data } = await api.post<ApiEnvelope<SubscriptionSummary>>('/subscriptions', input);
    return data.data;
  },

  async current(): Promise<SubscriptionSummary | null> {
    const { data } = await api.get<ApiEnvelope<SubscriptionSummary | null>>('/subscriptions/me');
    return data.data;
  },
};

export const analyticsApi = {
  async overview(): Promise<OwnerAnalyticsOverview> {
    const { data } = await api.get<ApiEnvelope<OwnerAnalyticsOverview>>('/owners/analytics/overview');
    return data.data;
  },

  async revenue(params: { range?: string } = {}): Promise<AnalyticsSeriesPoint[]> {
    const { data } = await api.get<ApiEnvelope<AnalyticsSeriesPoint[]>>('/owners/analytics/revenue', {
      params,
    });
    return data.data;
  },

  async occupancy(): Promise<AnalyticsSeriesPoint[]> {
    const { data } = await api.get<ApiEnvelope<AnalyticsSeriesPoint[]>>('/owners/analytics/occupancy');
    return data.data;
  },

  async bookingTrend(): Promise<AnalyticsSeriesPoint[]> {
    const { data } = await api.get<ApiEnvelope<AnalyticsSeriesPoint[]>>(
      '/owners/analytics/booking-trend',
    );
    return data.data;
  },
};

export const adminApi = {
  async overview(): Promise<AdminOverview> {
    const { data } = await api.get<ApiEnvelope<AdminOverview>>('/admin/overview');
    return data.data;
  },

  async analytics(): Promise<unknown> {
    const { data } = await api.get<ApiEnvelope<unknown>>('/admin/analytics');
    return data.data;
  },

  async listOwners(params: { page?: number; limit?: number; keyword?: string } = {}): Promise<{
    items: unknown[];
    pagination: unknown;
  }> {
    const { data } = await api.get('/admin/owners', { params });
    return data.data;
  },

  async reviewOwnerVerification(ownerId: string, input: { status: 'APPROVED' | 'REJECTED'; note?: string }) {
    const { data } = await api.patch(`/admin/owners/${ownerId}/verification`, input);
    return data.data;
  },

  async listBoardingHouses(params: { page?: number; limit?: number; keyword?: string } = {}): Promise<{
    items: unknown[];
    pagination: unknown;
  }> {
    const { data } = await api.get('/admin/boarding-houses', { params });
    return data.data;
  },

  async moderateBoarding(houseId: string, input: { status: 'APPROVED' | 'REJECTED' | 'PENDING'; note?: string }) {
    const { data } = await api.patch(`/admin/boarding-houses/${houseId}/moderation`, input);
    return data.data;
  },

  async listTenants(params: { page?: number; limit?: number; keyword?: string } = {}) {
    const { data } = await api.get('/admin/tenants', { params });
    return data.data;
  },

  async listSubscriptions(params: { page?: number; limit?: number; keyword?: string } = {}) {
    const { data } = await api.get('/admin/subscriptions', { params });
    return data.data;
  },
};

export const uploadApi = {
  async avatar(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/uploads/avatar', form);
    return data.data;
  },

  async gallery(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/uploads/gallery', form);
    return data.data;
  },

  async receipt(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/uploads/receipt', form);
    return data.data;
  },

  async identity(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/uploads/identity', form);
    return data.data;
  },
};