import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function createReview(data: Prisma.ReviewUncheckedCreateInput) {
  return prisma.review.create({
    data,
    include: {
      tenant: { include: { user: { select: { id: true, fullName: true, avatar: true } } } },
      reply: true,
    },
  });
}

export async function findReviewById(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: {
      tenant: { include: { user: { select: { id: true, fullName: true, avatar: true } } } },
      reply: true,
    },
  });
}

export async function listReviewsByHouse(
  boardingHouseId: string,
  opts: { skip: number; take: number },
) {
  const where: Prisma.ReviewWhereInput = { boardingHouseId, deletedAt: null };
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        tenant: { include: { user: { select: { id: true, fullName: true, avatar: true } } } },
        reply: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.review.count({ where }),
  ]);
  return { items, total };
}

export async function listReviewsByTenant(tenantId: string) {
  return prisma.review.findMany({
    where: { tenantId, deletedAt: null },
    include: {
      boardingHouse: { select: { id: true, name: true, thumbnail: true } },
      reply: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function countUserReview(tenantId: string, boardingHouseId: string) {
  return prisma.review.count({ where: { tenantId, boardingHouseId, deletedAt: null } });
}

export async function createReviewReply(reviewId: string, ownerId: string, comment: string) {
  return prisma.reviewReply.create({ data: { reviewId, ownerId, comment } });
}

export async function recomputeRating(boardingHouseId: string) {
  const agg = await prisma.review.aggregate({
    where: { boardingHouseId, deletedAt: null },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.boardingHouse.update({
    where: { id: boardingHouseId },
    data: { rating: agg._avg.rating ?? 0, ratingCount: agg._count._all },
  });
}
