import type { RoomStatus } from '../../../generated/prisma/client.js';

export interface CreateRoomInput {
  boardingHouseId: string;
  roomNumber: string;
  floor?: number;
  price: number;
  size?: number | null;
  stock?: number;
  description?: string | null;
  facilities?: string[];
  images?: string[];
  status?: RoomStatus;
}

export type UpdateRoomInput = Partial<Omit<CreateRoomInput, 'boardingHouseId'>>;
