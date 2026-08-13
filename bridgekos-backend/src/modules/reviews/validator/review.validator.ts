import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid('Invalid booking id'),
    rating: z.coerce
      .number()
      .int()
      .min(1, 'Rating must be between 1 and 5')
      .max(5, 'Rating must be between 1 and 5'),
    comment: z.string().trim().min(2).max(1000).optional().nullable(),
    photo: z.string().url('Invalid photo URL').optional().nullable(),
  }),
});

export const createReplySchema = z.object({
  body: z.object({
    comment: z.string().trim().min(2, 'Reply must be at least 2 characters').max(1000),
  }),
});

export const listReviewsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export type CreateReviewBody = z.infer<typeof createReviewSchema>['body'];
export type CreateReplyBody = z.infer<typeof createReplySchema>['body'];
