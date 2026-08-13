import { BadRequestError, ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { findTenantByUserId } from '../../tenants/repository/tenant.repository.js';
import { findOwnerById, findOwnerByUserId } from '../../owners/repository/owner.repository.js';
import {
  findPaymentById,
  findPaymentByBookingId,
  listPaymentsByOwner,
  listPaymentsByTenant,
  updatePayment,
} from '../repository/payment.repository.js';
import * as notificationService from '../../notifications/service/notification.service.js';
import { buildPaginationMeta, parsePagination } from '../../../common/pagination.js';

export async function listMine(userId: string, query: Record<string, unknown>) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Tenant profile not found');

  const pagination = parsePagination(query);
  const { items, total } = await listPaymentsByTenant(tenant.id, {
    skip: pagination.skip,
    take: pagination.take,
  });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function listByOwner(userId: string, query: Record<string, unknown>) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Owner profile not found');

  const pagination = parsePagination(query);
  const { items, total } = await listPaymentsByOwner(owner.id, {
    skip: pagination.skip,
    take: pagination.take,
  });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function getById(userId: string, paymentId: string) {
  const payment = await findPaymentById(paymentId);
  if (!payment) throw new NotFoundError('Payment not found');
  await assertParticipant(userId, payment);
  return payment;
}

export async function uploadReceipt(userId: string, paymentId: string, receiptUrl: string) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Only tenants can upload payment receipts');

  const payment = await findPaymentById(paymentId);
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.booking.tenantId !== tenant.id)
    throw new ForbiddenError('Payment does not belong to you');
  if (payment.status !== 'PENDING')
    throw new BadRequestError('Only pending payments can accept a receipt');

  const updated = await updatePayment(payment.id, { receiptUrl });
  const owner = await findOwnerById(payment.booking.room.boardingHouse.ownerId);
  if (owner) {
    await notificationService.create(owner.userId, {
      type: 'PAYMENT',
      title: 'Bukti pembayaran diterima',
      body: `${payment.invoiceNumber} menunggu konfirmasi`,
    });
  }
  return updated;
}

export async function confirmPaid(userId: string, paymentId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can confirm payments');

  const payment = await findPaymentById(paymentId);
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.booking.room.boardingHouse.ownerId !== owner.id) {
    throw new ForbiddenError('Payment does not belong to your boarding house');
  }
  if (payment.status !== 'PENDING')
    throw new BadRequestError('Only pending payments can be confirmed');

  const updated = await updatePayment(payment.id, { status: 'PAID', paidAt: new Date() });
  await notificationService.create(payment.booking.tenant.user.id, {
    type: 'PAYMENT',
    title: 'Pembayaran dikonfirmasi',
    body: `${payment.invoiceNumber} telah dibayar`,
  });
  return updated;
}

export async function refund(userId: string, paymentId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can refund payments');

  const payment = await findPaymentById(paymentId);
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.booking.room.boardingHouse.ownerId !== owner.id) {
    throw new ForbiddenError('Payment does not belong to your boarding house');
  }
  if (payment.status !== 'PAID') throw new BadRequestError('Only paid payments can be refunded');

  return updatePayment(payment.id, { status: 'REFUNDED' });
}

export async function getByBooking(userId: string, bookingId: string) {
  const payment = await findPaymentByBookingId(bookingId);
  if (!payment) throw new NotFoundError('Payment not found');
  return getById(userId, payment.id);
}

async function assertParticipant(
  userId: string,
  payment: NonNullable<Awaited<ReturnType<typeof findPaymentById>>>,
): Promise<void> {
  const tenant = await findTenantByUserId(userId);
  if (tenant && payment.booking.tenantId === tenant.id) return;

  const owner = await findOwnerByUserId(userId);
  if (owner && payment.booking.room.boardingHouse.ownerId === owner.id) return;

  throw new ForbiddenError('Payment does not belong to you');
}
