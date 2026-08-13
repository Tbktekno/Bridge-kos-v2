import { api } from '@/services/api';
import type { PaginationMeta } from '@/types/auth';
import type {
  BookingDetail,
  BookingSummary,
  CreateBookingInput,
  PaymentReceiptInput,
  PaymentSummary,
  BookingStatus,
  PaymentStatus,
} from '@/types/booking';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus | PaymentStatus;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export const bookingApi = {
  async create(input: CreateBookingInput): Promise<BookingDetail> {
    const { data } = await api.post<ApiEnvelope<BookingDetail>>('/bookings', input);
    return data.data;
  },

  async listMine(params: ListQuery = {}): Promise<Paginated<BookingSummary>> {
    const { data } = await api.get<ApiEnvelope<Paginated<BookingSummary>>>('/bookings/me', {
      params,
    });
    return data.data;
  },

  async listByOwner(params: ListQuery = {}): Promise<Paginated<BookingSummary>> {
    const { data } = await api.get<ApiEnvelope<Paginated<BookingSummary>>>('/bookings/owner/me', {
      params,
    });
    return data.data;
  },

  async detail(id: string): Promise<BookingDetail> {
    const { data } = await api.get<ApiEnvelope<BookingDetail>>(`/bookings/${id}`);
    return data.data;
  },

  async cancel(id: string): Promise<BookingDetail> {
    const { data } = await api.post<ApiEnvelope<BookingDetail>>(`/bookings/${id}/cancel`);
    return data.data;
  },

  async confirm(id: string): Promise<BookingDetail> {
    const { data } = await api.patch<ApiEnvelope<BookingDetail>>(`/bookings/${id}/confirm`);
    return data.data;
  },

  async reject(id: string): Promise<BookingDetail> {
    const { data } = await api.patch<ApiEnvelope<BookingDetail>>(`/bookings/${id}/reject`);
    return data.data;
  },

  async complete(id: string): Promise<BookingDetail> {
    const { data } = await api.patch<ApiEnvelope<BookingDetail>>(`/bookings/${id}/complete`);
    return data.data;
  },
};

export const paymentApi = {
  async listMine(params: ListQuery = {}): Promise<Paginated<PaymentSummary>> {
    const { data } = await api.get<ApiEnvelope<Paginated<PaymentSummary>>>('/payments/me', {
      params,
    });
    return data.data;
  },

  async listByOwner(params: ListQuery = {}): Promise<Paginated<PaymentSummary>> {
    const { data } = await api.get<ApiEnvelope<Paginated<PaymentSummary>>>('/payments/owner/me', {
      params,
    });
    return data.data;
  },

  async detail(id: string): Promise<PaymentSummary> {
    const { data } = await api.get<ApiEnvelope<PaymentSummary>>(`/payments/${id}`);
    return data.data;
  },

  async detailByBooking(bookingId: string): Promise<PaymentSummary[]> {
    const { data } = await api.get<ApiEnvelope<PaymentSummary[]>>(`/payments/booking/${bookingId}`);
    return data.data;
  },

  async uploadReceipt(id: string, input: PaymentReceiptInput): Promise<PaymentSummary> {
    const { data } = await api.post<ApiEnvelope<PaymentSummary>>(
      `/payments/${id}/upload-receipt`,
      input,
    );
    return data.data;
  },

  async confirmPaid(id: string): Promise<PaymentSummary> {
    const { data } = await api.patch<ApiEnvelope<PaymentSummary>>(`/payments/${id}/confirm-paid`);
    return data.data;
  },

  async refund(id: string): Promise<PaymentSummary> {
    const { data } = await api.patch<ApiEnvelope<PaymentSummary>>(`/payments/${id}/refund`);
    return data.data;
  },
};