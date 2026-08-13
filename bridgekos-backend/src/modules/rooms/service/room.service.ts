import type { Prisma } from '../../../generated/prisma/client.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { findOwnerByUserId } from '../../owners/repository/owner.repository.js';
import { findBoardingHouseById } from '../../boarding_houses/repository/boarding-house.repository.js';
import {
  countRooms,
  createRoom,
  findRoomById,
  listRoomsByHouse,
  softDeleteRoom,
  updateRoom,
} from '../repository/room.repository.js';
import { parsePagination, buildPaginationMeta } from '../../../common/pagination.js';
import type { CreateRoomInput, UpdateRoomInput } from '../types/room.types.js';

async function requireOwnedHouse(userId: string, houseId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can manage rooms');

  const house = await findBoardingHouseById(houseId);
  if (!house || house.ownerId !== owner.id) throw new NotFoundError('Boarding house not found');
  return owner;
}

export async function create(userId: string, input: CreateRoomInput) {
  await requireOwnedHouse(userId, input.boardingHouseId);

  const existing = await countRooms({
    boardingHouseId: input.boardingHouseId,
    roomNumber: input.roomNumber,
    deletedAt: null,
  });
  if (existing > 0) throw new ConflictError('Room number already exists in this house');

  return createRoom(input);
}

export async function listByHouse(boardingHouseId: string, query: Record<string, unknown>) {
  const house = await findBoardingHouseById(boardingHouseId);
  if (!house) throw new NotFoundError('Boarding house not found');

  const pagination = parsePagination(query);
  const items = await listRoomsByHouse(boardingHouseId, {
    skip: pagination.skip,
    take: pagination.take,
  });
  const total = await countRooms({ boardingHouseId, deletedAt: null });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function getById(id: string) {
  const room = await findRoomById(id);
  if (!room || room.deletedAt) throw new NotFoundError('Room not found');
  return room;
}

export async function update(userId: string, roomId: string, input: UpdateRoomInput) {
  const room = await findRoomById(roomId);
  if (!room || room.deletedAt) throw new NotFoundError('Room not found');
  await requireOwnedHouse(userId, room.boardingHouseId);

  if (input.roomNumber && input.roomNumber !== room.roomNumber) {
    const collision = await countRooms({
      boardingHouseId: room.boardingHouseId,
      roomNumber: input.roomNumber,
      deletedAt: null,
    });
    if (collision > 0) throw new ConflictError('Room number already exists in this house');
  }

  const data: Prisma.RoomUncheckedUpdateInput = {};
  if (input.roomNumber !== undefined) data.roomNumber = input.roomNumber;
  if (input.floor !== undefined) data.floor = input.floor;
  if (input.price !== undefined) data.price = input.price;
  if (input.size !== undefined) data.size = input.size;
  if (input.stock !== undefined) data.stock = input.stock;
  if (input.description !== undefined) data.description = input.description;
  if (input.facilities !== undefined) data.facilities = input.facilities;
  if (input.images !== undefined) data.images = input.images;
  if (input.status !== undefined) data.status = input.status;

  return updateRoom(roomId, data);
}

export async function remove(userId: string, roomId: string) {
  const room = await findRoomById(roomId);
  if (!room || room.deletedAt) throw new NotFoundError('Room not found');
  await requireOwnedHouse(userId, room.boardingHouseId);
  await softDeleteRoom(roomId);
}
