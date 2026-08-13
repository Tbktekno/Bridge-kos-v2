import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function createNotification(
  userId: string,
  data: Omit<Prisma.NotificationUncheckedCreateInput, 'userId'>,
) {
  return prisma.notification.create({ data: { userId, ...data } });
}

export async function listNotificationsByUser(
  userId: string,
  opts: { skip: number; take: number; isRead?: boolean },
) {
  const where: Prisma.NotificationWhereInput = { userId };
  if (opts.isRead !== undefined) where.isRead = opts.isRead;

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items, total, unreadCount };
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
