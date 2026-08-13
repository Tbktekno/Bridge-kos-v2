import { prisma } from '../../../utils/prisma.js';

export async function createFavorite(tenantId: string, boardingHouseId: string) {
  return prisma.favorite.create({ data: { tenantId, boardingHouseId } });
}

export async function deleteFavorite(tenantId: string, boardingHouseId: string) {
  return prisma.favorite.deleteMany({ where: { tenantId, boardingHouseId } });
}

export async function findFavorite(tenantId: string, boardingHouseId: string) {
  return prisma.favorite.findUnique({
    where: { tenantId_boardingHouseId: { tenantId, boardingHouseId } },
  });
}

export async function listFavoritesByTenant(tenantId: string) {
  return prisma.favorite.findMany({
    where: { tenantId },
    include: {
      boardingHouse: {
        include: {
          images: { take: 1 },
          owner: { select: { businessName: true, logo: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
