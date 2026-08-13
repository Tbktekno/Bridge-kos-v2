import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { boardingHouseApi, roomApi } from '@/services/boarding-house.api';
import { bookingApi, paymentApi } from '@/services/booking.api';
import { notificationApi, favoriteApi, reviewApi } from '@/services/interaction.api';
import {
  ownerApi,
  subscriptionApi,
  analyticsApi,
  tenantApi,
  adminApi,
} from '@/services/domain.api';
import { QUERY_KEYS } from '@/constants/app';
import type { BoardingHouseQuery } from '@/types/boarding-house';
import type { ListQuery } from '@/services/booking.api';
import type { BookingStatus, PaymentStatus } from '@/types/booking';

export function useBoardingHouses(params: BoardingHouseQuery = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.boardingHouses.list, params],
    queryFn: () => boardingHouseApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useBoardingHouse(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.boardingHouses.detail, id],
    queryFn: () => boardingHouseApi.detail(id as string),
    enabled: Boolean(id),
  });
}

export function useCloseBoardingHouse(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.boardingHouses.detail, id, 'contact'],
    queryFn: () => boardingHouseApi.contact(id as string),
    enabled: Boolean(id),
  });
}

export function useMyHouses(params: BoardingHouseQuery = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.boardingHouses.list, 'mine', params],
    queryFn: () => boardingHouseApi.listMine(params),
  });
}

export function useRooms(boardingHouseId: string | undefined) {
  return useQuery({
    queryKey: ['rooms', boardingHouseId],
    queryFn: () => roomApi.listForHouse(boardingHouseId as string),
    enabled: Boolean(boardingHouseId),
  });
}

export function useMyBookings(params: ListQuery = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.bookings.list, 'me', params],
    queryFn: () => bookingApi.listMine(params),
  });
}

export function useOwnerBookings(params: ListQuery = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.bookings.list, 'owner', params],
    queryFn: () => bookingApi.listByOwner(params),
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.bookings.detail, id],
    queryFn: () => bookingApi.detail(id as string),
    enabled: Boolean(id),
  });
}

export function useMyPayments(params: ListQuery = {}) {
  return useQuery({
    queryKey: ['payments/me', params],
    queryFn: () => paymentApi.listMine(params),
  });
}

export function useOwnerPayments(params: ListQuery = {}) {
  return useQuery({
    queryKey: ['payments/owner', params],
    queryFn: () => paymentApi.listByOwner(params),
  });
}

export function useNotifications(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.notifications.list, params],
    queryFn: () => notificationApi.list(params),
  });
}

export function useUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [QUERY_KEYS.notifications.unread],
    queryFn: () => notificationApi.unreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: [QUERY_KEYS.favorites.list],
    queryFn: () => favoriteApi.list(),
  });
}

export function useReviews(houseId: string | undefined, params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['reviews', houseId, params],
    queryFn: () => reviewApi.listByHouse(houseId as string, params),
    enabled: Boolean(houseId),
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['reviews/me'],
    queryFn: () => reviewApi.listMine(),
  });
}

export function useOwnerProfile() {
  return useQuery({
    queryKey: ['owner/me'],
    queryFn: () => ownerApi.getMe(),
  });
}

export function useTenantProfile() {
  return useQuery({
    queryKey: ['tenant/me'],
    queryFn: () => tenantApi.getMe(),
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptions/plans'],
    queryFn: () => subscriptionApi.plans(),
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscriptions/me'],
    queryFn: () => subscriptionApi.current(),
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics/overview'],
    queryFn: () => analyticsApi.overview(),
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin/overview'],
    queryFn: () => adminApi.overview(),
  });
}

export type { BookingStatus, PaymentStatus };