import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export const boardingHouseInclude = {
  images: { orderBy: { order: 'asc' as const } },
  owner: {
    select: {
      id: true,
      businessName: true,
      logo: true,
      whatsappNumber: true,
      user: { select: { fullName: true, avatar: true, phone: true } },
    },
  },
} satisfies Prisma.BoardingHouseInclude;

export type BoardingHouseWithRelations = Prisma.BoardingHouseGetPayload<{
  include: typeof boardingHouseInclude;
}>;

export async function createBoardingHouse(
  ownerId: string,
  data: Omit<Prisma.BoardingHouseUncheckedCreateInput, 'ownerId'>,
) {
  return prisma.boardingHouse.create({
    data: { ...data, ownerId },
    include: boardingHouseInclude,
  });
}

export async function findBoardingHouseById(id: string) {
  return prisma.boardingHouse.findUnique({
    where: { id },
    include: {
      ...boardingHouseInclude,
      rooms: {
        where: { deletedAt: null },
        orderBy: { price: 'asc' },
      },
    },
  });
}

export async function findBoardingHouseBySlug(slug: string) {
  return prisma.boardingHouse.findUnique({
    where: { slug },
    include: {
      ...boardingHouseInclude,
      rooms: { where: { deletedAt: null }, orderBy: { price: 'asc' } },
    },
  });
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.boardingHouse.findUnique({
    where: { slug },
    select: { id: true },
  });
  return existing !== null && existing.id !== excludeId;
}

export async function listBoardingHouses(params: {
  where: Prisma.BoardingHouseWhereInput;
  skip: number;
  take: number;
  orderBy: Prisma.BoardingHouseOrderByWithRelationInput;
}) {
  const [items, total] = await Promise.all([
    prisma.boardingHouse.findMany({
      where: params.where,
      include: boardingHouseInclude,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
    }),
    prisma.boardingHouse.count({ where: params.where }),
  ]);
  return { items, total };
}

export async function updateBoardingHouse(id: string, data: Prisma.BoardingHouseUpdateInput) {
  return prisma.boardingHouse.update({
    where: { id },
    data,
    include: boardingHouseInclude,
  });
}

export async function softDeleteBoardingHouse(id: string) {
  return prisma.boardingHouse.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'ARCHIVED' },
  });
}

export async function addBoardingImage(
  boardingHouseId: string,
  data: { url: string; isThumbnail?: boolean; order?: number },
) {
  return prisma.boardingImage.create({
    data: {
      boardingHouseId,
      url: data.url,
      isThumbnail: data.isThumbnail ?? false,
      order: data.order ?? 0,
    },
  });
}

export async function removeBoardingImage(id: string) {
  return prisma.boardingImage.delete({ where: { id } });
}
