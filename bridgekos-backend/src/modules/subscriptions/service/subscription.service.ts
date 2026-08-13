import type { Prisma } from '../../../generated/prisma/client.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { findOwnerByUserId } from '../../owners/repository/owner.repository.js';
import {
  createSubscription,
  findLatestSubscriptionByOwner,
} from '../repository/subscription.repository.js';
import { PLAN_CATALOG, getPlan, planExpiresAt, planPrice } from '../constants/plans.js';
import type { SubscribeInput } from '../types/subscription.types.js';

export function listPlans() {
  return PLAN_CATALOG;
}

export async function subscribe(userId: string, input: SubscribeInput) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can subscribe');

  const definition = getPlan(input.plan);
  if (input.plan === 'FREE') {
    throw new BadRequestError('Free plan does not require a subscription');
  }

  const price = planPrice(input.plan, input.billingCycle);
  return createSubscription({
    ownerId: owner.id,
    plan: input.plan,
    billingCycle: input.billingCycle,
    price,
    features: definition.features as unknown as Prisma.InputJsonValue,
    status: 'ACTIVE',
    startsAt: new Date(),
    expiresAt: planExpiresAt(input.billingCycle),
  });
}

export async function current(userId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new NotFoundError('Owner profile not found');

  const subscription = await findLatestSubscriptionByOwner(owner.id);
  if (!subscription) {
    return { plan: 'FREE' as const, status: 'ACTIVE' as const };
  }
  return subscription;
}
