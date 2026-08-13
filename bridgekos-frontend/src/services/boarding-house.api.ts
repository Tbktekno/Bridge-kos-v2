import { api } from '@/services/api';
import type { PaginationMeta } from '@/types/auth';
import type {
  BoardingHouseQuery,
  BoardingHouseListResponse,
  BoardingHouseSummary,
  BoardingHouseDetail,
  CreateBoardingHouseInput,
  UpdateBoardingHouseInput,
} from '@/types/boarding-house';
import type { RoomSummary, RoomInput } from '@/types/room';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface WhatsAppContactResult {
  waLink: string;
  phone?: string;
}

export const boardingHouseApi = {
  async list(params: BoardingHouseQuery = {}): Promise<BoardingHouseListResponse> {
    const { data } = await api.get<ApiEnvelope<BoardingHouseListResponse>>('/boarding-houses', {
      params,
    });
    return data.data;
  },

  async detail(id: string): Promise<BoardingHouseDetail> {
    const { data } = await api.get<ApiEnvelope<BoardingHouseDetail>>(`/boarding-houses/${id}`);
    return data.data;
  },

  async contact(id: string): Promise<WhatsAppContactResult> {
    const { data } = await api.get<ApiEnvelope<WhatsAppContactResult>>(
      `/boarding-houses/${id}/contact`,
    );
    return data.data;
  },

  async listMine(params: BoardingHouseQuery = {}): Promise<BoardingHouseListResponse> {
    const { data } = await api.get<ApiEnvelope<BoardingHouseListResponse>>('/boarding-houses/owner/me', {
      params,
    });
    return data.data;
  },

  async detailOwner(id: string): Promise<BoardingHouseDetail> {
    const { data } = await api.get<ApiEnvelope<BoardingHouseDetail>>(`/boarding-houses/${id}/owner`);
    return data.data;
  },

  async create(input: CreateBoardingHouseInput): Promise<BoardingHouseSummary> {
    const { data } = await api.post<ApiEnvelope<BoardingHouseSummary>>('/boarding-houses', input);
    return data.data;
  },

  async update(id: string, input: UpdateBoardingHouseInput): Promise<BoardingHouseSummary> {
    const { data } = await api.patch<ApiEnvelope<BoardingHouseSummary>>(`/boarding-houses/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/boarding-houses/${id}`);
  },

  async addImage(id: string, url: string, caption?: string, isPrimary?: boolean): Promise<void> {
    await api.post(`/boarding-houses/${id}/images`, { url, caption, isPrimary });
  },

  async removeImage(id: string, imageId: string): Promise<void> {
    await api.delete(`/boarding-houses/${id}/images/${imageId}`);
  },
};

export const roomApi = {
  async listByHouse(boardingHouseId: string): Promise<RoomSummary[]> {
    const { data } = await api.get<ApiEnvelope<RoomSummary[]>>('/rooms', {
      params: { boardingHouseId },
    });
    return data.data;
  },

  async listForHouse(boardingHouseId: string): Promise<RoomSummary[]> {
    const { data } = await api.get<ApiEnvelope<RoomSummary[]>>(`/rooms/house/${boardingHouseId}`);
    return data.data;
  },

  async detail(id: string): Promise<RoomSummary> {
    const { data } = await api.get<ApiEnvelope<RoomSummary>>(`/rooms/${id}`);
    return data.data;
  },

  async create(input: RoomInput): Promise<RoomSummary> {
    const { data } = await api.post<ApiEnvelope<RoomSummary>>('/rooms', input);
    return data.data;
  },

  async update(id: string, input: Partial<RoomInput>): Promise<RoomSummary> {
    const { data } = await api.patch<ApiEnvelope<RoomSummary>>(`/rooms/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },
};