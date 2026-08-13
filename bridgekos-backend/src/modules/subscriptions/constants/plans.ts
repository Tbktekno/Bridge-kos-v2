import type { SubscriptionPlan, BillingCycle } from '../../../generated/prisma/client.js';

export interface PlanDefinition {
  plan: SubscriptionPlan;
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
  maxBoardingHouses: number;
  maxRooms?: number;
}

export const PLAN_CATALOG: PlanDefinition[] = [
  {
    plan: 'FREE',
    name: 'Free',
    monthlyPrice: 0,
    description: 'Untuk mulai mengelola kos',
    features: ['1 kos', '5 kamar', 'Pesan masuk', 'Dukungan komunitas'],
    maxBoardingHouses: 1,
  },
  {
    plan: 'STARTER',
    name: 'Starter',
    monthlyPrice: 49_000,
    description: 'Untuk pemilik kos kecil',
    features: ['3 kos', '20 kamar', 'Manajemen booking', 'Payment tracking'],
    maxBoardingHouses: 3,
  },
  {
    plan: 'BUSINESS',
    name: 'Business',
    monthlyPrice: 149_000,
    description: 'Untuk kos menengah',
    features: ['10 kos', '100 kamar', 'Analytics lengkap', 'Prioritas dukungan'],
    maxBoardingHouses: 10,
  },
  {
    plan: 'PREMIUM',
    name: 'Premium',
    monthlyPrice: 399_000,
    description: 'Untuk jaringan kos berskala besar',
    features: ['Kos tanpa batas', 'Kamar tanpa batas', 'API access', 'Dedicated support'],
    maxBoardingHouses: Number.POSITIVE_INFINITY,
  },
];

export function getPlan(plan: SubscriptionPlan): PlanDefinition {
  const found = PLAN_CATALOG.find((item) => item.plan === plan);
  if (!found) throw new Error(`Unknown plan: ${plan}`);
  return found;
}

export function planPrice(plan: SubscriptionPlan, cycle: BillingCycle): number {
  const def = getPlan(plan);
  return cycle === 'YEARLY' ? def.monthlyPrice * 12 : def.monthlyPrice;
}

export function planExpiresAt(cycle: BillingCycle): Date {
  const now = new Date();
  return cycle === 'YEARLY' ? addMonths(now, 12) : addMonths(now, 1);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
