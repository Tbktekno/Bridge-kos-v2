import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function createSubscription(data: Prisma.SubscriptionUncheckedCreateInput) {
  return prisma.subscription.create({ data });
}

export async function findLatestSubscriptionByOwner(ownerId: string) {
  return prisma.subscription.findFirst({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
  });
}
