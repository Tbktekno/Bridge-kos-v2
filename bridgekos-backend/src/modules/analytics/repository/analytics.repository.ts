import { prisma } from '../../../utils/prisma.js';

export async function overviewStats(ownerId: string) {
  const houseWhere = { room: { boardingHouse: { ownerId } } };

  const [
    totalBookings,
    totalRevenueAgg,
    totalRooms,
    availableRooms,
    bookingsToday,
    totalReviews,
    publishedHouses,
    subscription,
  ] = await Promise.all([
    prisma.booking.count({ where: { ...houseWhere, deletedAt: null } }),
    prisma.payment.aggregate({
      where: { status: 'PAID', booking: { room: { boardingHouse: { ownerId } } } },
      _sum: { amount: true },
    }),
    prisma.room.count({ where: { boardingHouse: { ownerId }, deletedAt: null } }),
    prisma.room.count({
      where: { boardingHouse: { ownerId }, deletedAt: null, status: 'AVAILABLE' },
    }),
    prisma.booking.count({
      where: { ...houseWhere, createdAt: { gte: startOfDay() } },
    }),
    prisma.review.count({ where: { boardingHouse: { ownerId }, deletedAt: null } }),
    prisma.boardingHouse.count({ where: { ownerId, deletedAt: null, status: 'PUBLISHED' } }),
    prisma.subscription.findFirst({ where: { ownerId }, orderBy: { createdAt: 'desc' } }),
  ]);

  return {
    totalBookings,
    totalRevenue: totalRevenueAgg._sum.amount ?? 0,
    totalRooms,
    availableRooms,
    occupiedRooms: totalRooms - availableRooms,
    bookingsToday,
    totalReviews,
    publishedHouses,
    currentPlan: subscription?.plan ?? 'FREE',
  };
}

export async function paidPaymentsSince(ownerId: string, since: Date) {
  return prisma.payment.findMany({
    where: {
      status: 'PAID',
      paidAt: { gte: since },
      booking: { room: { boardingHouse: { ownerId } } },
    },
    select: { amount: true, paidAt: true },
  });
}

export async function bookingsSince(ownerId: string, since: Date) {
  return prisma.booking.findMany({
    where: {
      createdAt: { gte: since },
      deletedAt: null,
      room: { boardingHouse: { ownerId } },
    },
    select: { createdAt: true, totalPrice: true, status: true },
  });
}

export async function roomOccupancy(ownerId: string) {
  return prisma.room.findMany({
    where: { boardingHouse: { ownerId }, deletedAt: null },
    select: { id: true, roomNumber: true, status: true, floor: true },
    orderBy: { roomNumber: 'asc' },
  });
}

export async function latestSubscription(ownerId: string) {
  return prisma.subscription.findFirst({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
}

function startOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
