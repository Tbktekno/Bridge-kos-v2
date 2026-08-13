import { api } from '@/services/api';
import type {
  NotificationItem,
  ReviewItem,
  ReviewInput,
  ReviewReplyInput,
} from '@/types/domain';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationApi = {
  async list(params: { page?: number; limit?: number } = {}): Promise<{
    items: NotificationItem[];
    pagination: { page: number; totalItems: number; totalPages: number };
  }> {
    const { data } = await api.get('/notifications', { params });
    return data.data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get<ApiEnvelope<number>>('/notifications/unread-count');
    return data.data;
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};

export const favoriteApi = {
  async list(): Promise<Array<{ id: string; boardingHouseId: string; createdAt: string }>> {
    const { data } = await api.get('/favorites/me');
    return data.data;
  },

  async add(boardingHouseId: string): Promise<void> {
    await api.post(`/favorites/${boardingHouseId}`);
  },

  async remove(boardingHouseId: string): Promise<void> {
    await api.delete(`/favorites/${boardingHouseId}`);
  },
};

export const reviewApi = {
  async listByHouse(boardingHouseId: string, params: { page?: number; limit?: number } = {}): Promise<{
    items: ReviewItem[];
    pagination: { page: number; limit: number; totalItems: number; totalPages: number };
  }> {
    const { data } = await api.get(`/reviews/house/${boardingHouseId}`, { params });
    return data.data;
  },

  async listMine(): Promise<ReviewItem[]> {
    const { data } = await api.get<ApiEnvelope<ReviewItem[]>>('/reviews/me');
    return data.data;
  },

  async create(input: ReviewInput): Promise<ReviewItem> {
    const { data } = await api.post<ApiEnvelope<ReviewItem>>('/reviews', input);
    return data.data;
  },

  async reply(id: string, input: ReviewReplyInput): Promise<ReviewItem> {
    const { data } = await api.post<ApiEnvelope<ReviewItem>>(`/reviews/${id}/reply`, input);
    return data.data;
  },
};