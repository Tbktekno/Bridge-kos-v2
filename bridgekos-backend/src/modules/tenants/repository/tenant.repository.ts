import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function findTenantByUserId(userId: string) {
  return prisma.tenant.findUnique({ where: { userId } });
}

export async function findTenantById(id: string) {
  return prisma.tenant.findUnique({ where: { id } });
}

export async function updateTenant(
  id: string,
  data: {
    nickname?: string | null;
    emergencyContact?: string | null;
    preferences?: Prisma.InputJsonValue;
  },
) {
  return prisma.tenant.update({ where: { id }, data });
}
