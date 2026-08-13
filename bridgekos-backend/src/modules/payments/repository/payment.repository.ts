import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function createPayment(data: Prisma.PaymentUncheckedCreateInput) {
  return prisma.payment.create({ data });
}

export async function findPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          tenant: { include: { user: { select: { id: true, fullName: true, email: true } } } },
          room: { include: { boardingHouse: { select: { id: true, name: true, ownerId: true } } } },
        },
      },
    },
  });
}

export async function findPaymentByBookingId(bookingId: string) {
  return prisma.payment.findUnique({ where: { bookingId } });
}

export async function updatePayment(id: string, data: Prisma.PaymentUncheckedUpdateInput) {
  return prisma.payment.update({ where: { id }, data });
}

export async function listPaymentsByTenant(tenantId: string, opts: { skip: number; take: number }) {
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where: { tenantId },
      include: { booking: { include: { room: true } } },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.payment.count({ where: { tenantId } }),
  ]);
  return { items, total };
}

export async function listPaymentsByOwner(ownerId: string, opts: { skip: number; take: number }) {
  const where: Prisma.PaymentWhereInput = {
    booking: { room: { boardingHouse: { ownerId } } },
  };
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            room: true,
            tenant: { include: { user: { select: { id: true, fullName: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    }),
    prisma.payment.count({ where }),
  ]);
  return { items, total };
}
