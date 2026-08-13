import type { BillingCycle, SubscriptionPlan } from '../../../generated/prisma/client.js';

export interface SubscribeInput {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
}
