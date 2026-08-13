import { z } from 'zod';

export const uploadReceiptSchema = z.object({
  body: z.object({
    receiptUrl: z.string().url('Invalid receipt URL'),
  }),
});

export const listPaymentsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export type UploadReceiptBody = z.infer<typeof uploadReceiptSchema>['body'];
