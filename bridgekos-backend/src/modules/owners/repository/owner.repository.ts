import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function findOwnerByUserId(userId: string) {
  return prisma.owner.findUnique({ where: { userId } });
}

export async function findOwnerById(id: string) {
  return prisma.owner.findUnique({ where: { id } });
}

export async function findOwnerByUserIdWithDetails(userId: string) {
  return prisma.owner.findUnique({
    where: { userId },
    include: {
      bankAccounts: { orderBy: { isPrimary: 'desc' } },
      verifications: { orderBy: { createdAt: 'desc' } },
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export async function updateOwner(id: string, data: Prisma.OwnerUpdateInput) {
  return prisma.owner.update({ where: { id }, data });
}

export async function countOwners(where?: Prisma.OwnerWhereInput) {
  return prisma.owner.count({ where });
}
