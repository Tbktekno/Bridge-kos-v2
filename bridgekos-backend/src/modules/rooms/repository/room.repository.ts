import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function createRoom(data: Prisma.RoomUncheckedCreateInput) {
  return prisma.room.create({ data });
}

export async function findRoomById(id: string) {
  return prisma.room.findUnique({
    where: { id },
    include: { boardingHouse: { select: { id: true, name: true, ownerId: true } } },
  });
}

export async function listRoomsByHouse(
  boardingHouseId: string,
  opts?: { skip?: number; take?: number },
) {
  return prisma.room.findMany({
    where: { boardingHouseId, deletedAt: null },
    orderBy: { price: 'asc' },
    skip: opts?.skip,
    take: opts?.take,
  });
}

export async function countRooms(where: Prisma.RoomWhereInput) {
  return prisma.room.count({ where });
}

export async function updateRoom(id: string, data: Prisma.RoomUncheckedUpdateInput) {
  return prisma.room.update({ where: { id }, data });
}

export async function softDeleteRoom(id: string) {
  return prisma.room.update({ where: { id }, data: { deletedAt: new Date() } });
}
