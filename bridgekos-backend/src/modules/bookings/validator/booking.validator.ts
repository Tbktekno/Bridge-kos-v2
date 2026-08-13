import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    roomId: z.string().uuid('Invalid room id'),
    checkIn: z.string().datetime({ offset: true }).or(z.string().date()),
    checkOut: z.string().datetime({ offset: true }).or(z.string().date()),
    guestCount: z.coerce.number().int().min(1).max(10).optional(),
    notes: z.string().trim().max(500).optional().nullable(),
  }),
});

export const listBookingsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED']).optional(),
  }),
});

export type CreateBookingBody = z.infer<typeof createBookingSchema>['body'];
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>['query'];
