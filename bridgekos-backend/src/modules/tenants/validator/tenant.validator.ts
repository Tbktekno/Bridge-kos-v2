import { z } from 'zod';

export const updateTenantSchema = z.object({
  body: z.object({
    nickname: z.string().trim().min(1).max(60).optional().nullable(),
    emergencyContact: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number')
      .optional()
      .nullable(),
    preferences: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type UpdateTenantBody = z.infer<typeof updateTenantSchema>['body'];
