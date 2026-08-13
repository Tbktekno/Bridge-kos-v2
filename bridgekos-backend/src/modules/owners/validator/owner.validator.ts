import { z } from 'zod';

export const updateOwnerSchema = z.object({
  body: z.object({
    businessName: z.string().trim().min(2).max(120).optional(),
    businessDescription: z.string().trim().max(2000).optional().nullable(),
    logo: z.string().url('Invalid logo URL').optional().nullable(),
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^62[0-9]{8,15}$|^\+?[0-9]{9,15}$/, 'Invalid WhatsApp number')
      .optional()
      .nullable(),
  }),
});

export const createBankAccountSchema = z.object({
  body: z.object({
    bankName: z.string().trim().min(2, 'Bank name is required').max(60),
    accountNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{6,20}$/, 'Invalid account number'),
    accountHolderName: z.string().trim().min(2).max(120),
    isPrimary: z.boolean().optional(),
  }),
});

export const updateBankAccountSchema = z.object({
  body: z.object({
    bankName: z.string().trim().min(2).max(60).optional(),
    accountNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{6,20}$/, 'Invalid account number')
      .optional(),
    accountHolderName: z.string().trim().min(2).max(120).optional(),
    isPrimary: z.boolean().optional(),
  }),
});

export const submitVerificationSchema = z.object({
  body: z.object({
    identityPhotoUrl: z.string().url().optional(),
    businessLicenseUrl: z.string().url().optional(),
  }),
});

export type UpdateOwnerBody = z.infer<typeof updateOwnerSchema>['body'];
export type CreateBankAccountBody = z.infer<typeof createBankAccountSchema>['body'];
export type UpdateBankAccountBody = z.infer<typeof updateBankAccountSchema>['body'];
export type SubmitVerificationBody = z.infer<typeof submitVerificationSchema>['body'];
