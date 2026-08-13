import {
  countUnreadNotifications,
  createNotification,
  listNotificationsByUser,
  markAllNotificationsRead,
  markNotificationRead,
} from '../repository/notification.repository.js';
import { buildPaginationMeta, parsePagination } from '../../../common/pagination.js';
import type { Prisma } from '../../../generated/prisma/client.js';

export interface CreateNotificationInput {
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  channel?: 'PUSH' | 'EMAIL' | 'REALTIME';
}

export async function create(userId: string, input: CreateNotificationInput) {
  return createNotification(userId, {
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    data: input.data as Prisma.InputJsonValue | undefined,
    channel: input.channel ?? 'REALTIME',
  });
}

export async function list(userId: string, query: Record<string, unknown>) {
  const pagination = parsePagination(query);
  const { items, total, unreadCount } = await listNotificationsByUser(userId, {
    skip: pagination.skip,
    take: pagination.take,
  });
  return {
    items,
    total,
    unreadCount,
    meta: buildPaginationMeta(pagination, total),
  };
}

export async function markRead(userId: string, notificationId: string) {
  const result = await markNotificationRead(notificationId, userId);
  return result.count > 0;
}

export async function markAllRead(userId: string) {
  return markAllNotificationsRead(userId);
}

export async function getUnreadCount(userId: string) {
  return countUnreadNotifications(userId);
}
