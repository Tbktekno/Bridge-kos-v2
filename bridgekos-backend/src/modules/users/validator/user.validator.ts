import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100)
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number')
      .optional()
      .nullable(),
    gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
    birthDate: z.string().datetime({ offset: true }).or(z.string().date()).optional().nullable(),
    address: z.string().trim().max(500).optional().nullable(),
    avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  }),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>['body'];
