import { z } from 'zod';

export const subscribeSchema = z.object({
  body: z.object({
    plan: z.enum(['FREE', 'STARTER', 'BUSINESS', 'PREMIUM']),
    billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  }),
});

export type SubscribeBody = z.infer<typeof subscribeSchema>['body'];
