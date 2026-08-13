import { z } from 'zod';

export const reviewVerificationSchema = z.object({
  body: z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    note: z.string().trim().max(500).optional().nullable(),
  }),
});

export const moderateBoardingSchema = z.object({
  body: z.object({
    status: z.enum(['PUBLISHED', 'ARCHIVED', 'DRAFT']),
  }),
});

export const adminListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    role: z.enum(['OWNER', 'TENANT', 'ADMIN']).optional(),
    status: z.string().max(20).optional(),
  }),
});

export type ReviewVerificationBody = z.infer<typeof reviewVerificationSchema>['body'];
export type ModerateBoardingBody = z.infer<typeof moderateBoardingSchema>['body'];
