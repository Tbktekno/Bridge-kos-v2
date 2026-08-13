import { z } from 'zod';

const stringArray = (max: number) => z.array(z.string().trim().min(1).max(60)).max(max).optional();

export const createRoomSchema = z.object({
  body: z.object({
    boardingHouseId: z.string().uuid('Invalid boarding house id'),
    roomNumber: z.string().trim().min(1).max(30),
    floor: z.coerce.number().int().default(1),
    price: z.coerce.number().min(0, 'Price must be >= 0'),
    size: z.coerce.number().positive().optional().nullable(),
    stock: z.coerce.number().int().min(1).default(1),
    description: z.string().trim().max(1000).optional(),
    facilities: stringArray(30),
    images: stringArray(20),
    status: z.enum(['AVAILABLE', 'BOOKED', 'MAINTENANCE']).optional(),
  }),
});

export const updateRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().trim().min(1).max(30).optional(),
    floor: z.coerce.number().int().optional(),
    price: z.coerce.number().min(0).optional(),
    size: z.coerce.number().positive().optional().nullable(),
    stock: z.coerce.number().int().min(1).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    facilities: stringArray(20),
    images: stringArray(20),
    status: z.enum(['AVAILABLE', 'BOOKED', 'MAINTENANCE']).optional(),
  }),
});

export const listRoomsQuerySchema = z.object({
  query: z.object({
    boardingHouseId: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export type CreateRoomBody = z.infer<typeof createRoomSchema>['body'];
export type UpdateRoomBody = z.infer<typeof updateRoomSchema>['body'];
