import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function userCount(where: Prisma.UserWhereInput) {
  return prisma.user.count({ where });
}

export async function listUsers(opts: { role?: string; skip: number; take: number }) {
  const where: Prisma.UserWhereInput = {};
  if (opts.role) where.role = opts.role as Prisma.UserWhereInput['role'];
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}

export async function listOwners(opts: { skip: number; take: number }) {
  const [items, total] = await Promise.all([
    prisma.owner.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true, createdAt: true } },
        _count: { select: { boardingHouses: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.owner.count(),
  ]);
  return { items, total };
}

export async function updateOwnerVerification(
  ownerId: string,
  data: { verificationStatus: string; note?: string; reviewedBy: string },
) {
  const owner = await prisma.owner.update({
    where: { id: ownerId },
    data: {
      verificationStatus: data.verificationStatus as never,
      verifiedAt: data.verificationStatus === 'VERIFIED' ? new Date() : null,
    },
  });
  await prisma.ownerVerification.updateMany({
    where: { ownerId },
    data: {
      status: data.verificationStatus as never,
      note: data.note ?? null,
      reviewedBy: data.reviewedBy,
      reviewedAt: new Date(),
    },
  });
  return owner;
}

export async function listBoardingHousesForAdmin(opts: {
  status?: string;
  skip: number;
  take: number;
}) {
  const where: Prisma.BoardingHouseWhereInput = {};
  if (opts.status) where.status = opts.status as never;
  const [items, total] = await Promise.all([
    prisma.boardingHouse.findMany({
      where,
      include: {
        owner: { select: { id: true, businessName: true, user: { select: { fullName: true } } } },
        _count: { select: { rooms: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.boardingHouse.count({ where }),
  ]);
  return { items, total };
}

export async function moderateBoardingHouse(houseId: string, status: string) {
  return prisma.boardingHouse.update({
    where: { id: houseId },
    data: {
      status: status as never,
      publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
    },
  });
}

export async function listTenants(opts: { skip: number; take: number }) {
  const [items, total] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true, createdAt: true } },
        _count: { select: { bookings: true, favorites: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.tenant.count(),
  ]);
  return { items, total };
}

export async function listSubscriptions(opts: { skip: number; take: number }) {
  const [items, total] = await Promise.all([
    prisma.subscription.findMany({
      include: {
        owner: { include: { user: { select: { id: true, email: true, fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.subscription.count(),
  ]);
  return { items, total };
}

export async function revenueAggregate() {
  const agg = await prisma.payment.aggregate({
    where: { status: 'PAID' },
    _sum: { amount: true },
    _count: true,
  });
  return { platformRevenue: agg._sum.amount ?? 0, paidPayments: agg._count };
}

export async function topCities(limit: number) {
  const grouped = await prisma.boardingHouse.groupBy({
    by: ['city'],
    where: { deletedAt: null, status: 'PUBLISHED' },
    _count: { _all: true },
  });
  return grouped
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, limit)
    .map((item) => ({ city: item.city, count: item._count._all }));
}

export async function ownerByCity(limit: number) {
  const grouped = await prisma.boardingHouse.groupBy({
    by: ['city', 'ownerId'],
    where: { deletedAt: null, status: 'PUBLISHED' },
  });
  const counts = new Map<string, number>();
  for (const row of grouped) {
    if (!row.city) continue;
    counts.set(row.city, (counts.get(row.city) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([city, count]) => ({ city, count }));
}
