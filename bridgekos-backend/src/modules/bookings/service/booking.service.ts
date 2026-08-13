import { randomBytes } from 'node:crypto';
import type { BookingStatus } from '../../../generated/prisma/client.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { prisma } from '../../../utils/prisma.js';
import { findTenantByUserId } from '../../tenants/repository/tenant.repository.js';
import { findOwnerByUserId } from '../../owners/repository/owner.repository.js';
import { findRoomById, updateRoom } from '../../rooms/repository/room.repository.js';
import {
  countOverlappingBookings,
  findBookingById,
  listBookingsByOwner,
  listBookingsByTenant,
  updateBookingStatus,
} from '../repository/booking.repository.js';
import {
  findPaymentByBookingId,
  updatePayment,
} from '../../payments/repository/payment.repository.js';
import * as notificationService from '../../notifications/service/notification.service.js';
import { buildPaginationMeta, parsePagination } from '../../../common/pagination.js';
import type { CreateBookingInput } from '../types/booking.types.js';

const DAY_MS = 86_400_000;
const PAYMENT_TTL_MS = 48 * 60 * 60 * 1000;

type BookingWithRelations = NonNullable<Awaited<ReturnType<typeof findBookingById>>>;

function generateBookingNumber(): string {
  const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `BK-${yymmdd}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function generateInvoiceNumber(): string {
  const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `INV-${yymmdd}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function create(userId: string, input: CreateBookingInput) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Only tenants can create bookings');

  const room = await findRoomById(input.roomId);
  if (!room || room.deletedAt) throw new NotFoundError('Room not found');
  if (room.status === 'MAINTENANCE') throw new BadRequestError('Room is under maintenance');

  const checkIn = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    throw new BadRequestError('Invalid check-in or check-out date');
  }
  if (checkIn < new Date(Date.now() - DAY_MS))
    throw new BadRequestError('Check-in cannot be in the past');
  if (checkOut <= checkIn) throw new BadRequestError('Check-out must be after check-in');

  const durationDays = Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS);
  if (durationDays < 1) throw new BadRequestError('Booking must last at least 1 day');

  const overlapping = await countOverlappingBookings(room.id, checkIn, checkOut);
  if (overlapping >= room.stock)
    throw new BadRequestError('Room is not available for the selected dates');

  const totalPrice = durationDays * room.price;
  const bookingNumber = generateBookingNumber();
  const invoiceNumber = generateInvoiceNumber();

  const created = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        bookingNumber,
        tenantId: tenant.id,
        roomId: room.id,
        checkIn,
        checkOut,
        durationDays,
        guestCount: input.guestCount ?? 1,
        totalPrice,
        notes: input.notes ?? null,
      },
    });
    await tx.payment.create({
      data: {
        invoiceNumber,
        bookingId: b.id,
        tenantId: tenant.id,
        amount: totalPrice,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        expiredAt: new Date(Date.now() + PAYMENT_TTL_MS),
      },
    });
    return b;
  });

  const booking = await findBookingById(created.id);
  await notifyOwner(booking!, 'BOOKING', 'Pesanan baru masuk', {
    bookingNumber,
    totalPrice,
  });
  return booking;
}

export async function listMine(userId: string, query: Record<string, unknown>) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Tenant profile not found');

  const pagination = parsePagination(query);
  const status = typeof query.status === 'string' ? (query.status as BookingStatus) : undefined;
  const { items, total } = await listBookingsByTenant(tenant.id, {
    skip: pagination.skip,
    take: pagination.take,
    status,
  });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function listByOwner(userId: string, query: Record<string, unknown>) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can manage bookings');

  const pagination = parsePagination(query);
  const status = typeof query.status === 'string' ? (query.status as BookingStatus) : undefined;
  const { items, total } = await listBookingsByOwner(owner.id, {
    skip: pagination.skip,
    take: pagination.take,
    status,
  });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function getById(userId: string, bookingId: string) {
  const booking = await findBookingById(bookingId);
  if (!booking) throw new NotFoundError('Booking not found');
  await assertParticipant(userId, booking);
  return booking;
}

export async function cancelByTenant(userId: string, bookingId: string) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Only tenants can cancel bookings');

  const booking = await findBookingById(bookingId);
  if (!booking) throw new NotFoundError('Booking not found');
  if (booking.tenantId !== tenant.id) throw new ForbiddenError('Booking does not belong to you');
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw new BadRequestError('Booking cannot be cancelled in its current status');
  }

  const updated = await updateBookingStatus(booking.id, 'CANCELLED');
  await expirePayment(booking.id);
  await updateRoom(booking.roomId, { status: 'AVAILABLE' });
  await notifyOwner(updated, 'BOOKING', 'Pesanan dibatalkan penyewa', {
    bookingNumber: booking.bookingNumber,
  });
  return updated;
}

export async function confirmByOwner(userId: string, bookingId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can manage bookings');
  const booking = await requireOwnedBooking(owner.id, bookingId);
  if (booking.status !== 'PENDING')
    throw new BadRequestError('Only pending bookings can be confirmed');

  const updated = await updateBookingStatus(booking.id, 'CONFIRMED');
  await markRoomBooked(booking.roomId);
  await notifyTenant(booking.tenant.user.id, 'BOOKING', 'Pesanan Anda dikonfirmasi', {
    bookingNumber: booking.bookingNumber,
  });
  return updated;
}

export async function rejectByOwner(userId: string, bookingId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can manage bookings');
  const booking = await requireOwnedBooking(owner.id, bookingId);
  if (booking.status !== 'PENDING')
    throw new BadRequestError('Only pending bookings can be rejected');

  const updated = await updateBookingStatus(booking.id, 'REJECTED');
  await expirePayment(booking.id);
  await notifyTenant(booking.tenant.user.id, 'BOOKING', 'Pesanan Anda ditolak', {
    bookingNumber: booking.bookingNumber,
  });
  return updated;
}

export async function completeByOwner(userId: string, bookingId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can manage bookings');
  const booking = await requireOwnedBooking(owner.id, bookingId);
  if (booking.status !== 'CONFIRMED')
    throw new BadRequestError('Only confirmed bookings can be completed');

  const updated = await updateBookingStatus(booking.id, 'COMPLETED');
  await updateRoom(booking.roomId, { status: 'AVAILABLE' });
  return updated;
}

async function requireOwnedBooking(
  ownerId: string,
  bookingId: string,
): Promise<BookingWithRelations> {
  const booking = await findBookingById(bookingId);
  if (!booking) throw new NotFoundError('Booking not found');
  if (booking.room.boardingHouse.ownerId !== ownerId) {
    throw new ForbiddenError('Booking does not belong to your boarding house');
  }
  return booking;
}

async function assertParticipant(userId: string, booking: BookingWithRelations): Promise<void> {
  const tenant = await findTenantByUserId(userId);
  if (tenant && booking.tenantId === tenant.id) return;

  const owner = await findOwnerByUserId(userId);
  if (owner && booking.room.boardingHouse.ownerId === owner.id) return;

  throw new ForbiddenError('Booking does not belong to you');
}

async function expirePayment(bookingId: string) {
  const payment = await findPaymentByBookingId(bookingId);
  if (payment && payment.status === 'PENDING') {
    await updatePayment(payment.id, { status: 'EXPIRED' });
  }
}

async function markRoomBooked(roomId: string) {
  const room = await findRoomById(roomId);
  if (room && room.stock <= 1) {
    await updateRoom(roomId, { status: 'BOOKED' });
  }
}

async function notifyOwner(
  booking: BookingWithRelations,
  type: string,
  title: string,
  data: Record<string, unknown>,
) {
  const ownerUserId = booking.room.boardingHouse.owner.user.id;
  await notificationService.create(ownerUserId, {
    type,
    title,
    body: `${booking.tenant.user.fullName} · ${booking.bookingNumber}`,
    data,
  });
}

async function notifyTenant(
  userId: string,
  type: string,
  title: string,
  data: Record<string, unknown>,
) {
  await notificationService.create(userId, { type, title, body: title, data });
}
