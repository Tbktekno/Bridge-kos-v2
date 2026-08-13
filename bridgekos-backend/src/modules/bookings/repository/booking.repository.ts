import type { BookingStatus, Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export interface CreateBookingData {
  bookingNumber: string;
  tenantId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  durationDays: number;
  guestCount: number;
  totalPrice: number;
  notes?: string;
}

export async function createBooking(data: CreateBookingData) {
  return prisma.booking.create({
    data: {
      bookingNumber: data.bookingNumber,
      tenantId: data.tenantId,
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      durationDays: data.durationDays,
      guestCount: data.guestCount,
      totalPrice: data.totalPrice,
      notes: data.notes ?? null,
    },
    include: bookingDetailInclude,
  });
}

const bookingDetailInclude = {
  tenant: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } },
  room: {
    include: {
      boardingHouse: {
        include: {
          owner: { include: { user: { select: { id: true, fullName: true, email: true } } } },
        },
      },
    },
  },
  payment: true,
} satisfies Prisma.BookingInclude;

export async function findBookingById(id: string) {
  return prisma.booking.findUnique({ where: { id }, include: bookingDetailInclude });
}

export async function findBookingByNumber(bookingNumber: string) {
  return prisma.booking.findUnique({ where: { bookingNumber }, include: bookingDetailInclude });
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  extra: Prisma.BookingUpdateInput = {},
) {
  const data: Prisma.BookingUpdateInput = { status, ...extra };
  if (status === 'CANCELLED') data.cancelledAt = new Date();
  if (status === 'COMPLETED') data.completedAt = new Date();
  return prisma.booking.update({ where: { id }, data, include: bookingDetailInclude });
}

export async function countOverlappingBookings(roomId: string, checkIn: Date, checkOut: Date) {
  return prisma.booking.count({
    where: {
      roomId,
      deletedAt: null,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }, { checkIn: checkIn }],
    },
  });
}

export async function listBookingsByTenant(
  tenantId: string,
  opts: { skip: number; take: number; status?: BookingStatus },
) {
  const where: Prisma.BookingWhereInput = { tenantId };
  if (opts.status) where.status = opts.status;
  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingDetailInclude,
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.booking.count({ where }),
  ]);
  return { items, total };
}

export async function listBookingsByOwner(
  ownerId: string,
  opts: { skip: number; take: number; status?: BookingStatus },
) {
  const where: Prisma.BookingWhereInput = { room: { boardingHouse: { ownerId } } };
  if (opts.status) where.status = opts.status;
  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingDetailInclude,
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.booking.count({ where }),
  ]);
  return { items, total };
}

export async function countBookings(where: Prisma.BookingWhereInput) {
  return prisma.booking.count({ where });
}
