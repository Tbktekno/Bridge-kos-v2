import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import * as subscriptionService from '../service/subscription.service.js';
import type { SubscribeBody } from '../validator/subscription.validator.js';

export const plans: RequestHandler = asyncHandler(async (_req, res) => {
  const plans = subscriptionService.listPlans();
  sendSuccess(res, plans, { message: 'Subscription plans retrieved' });
});

export const subscribe: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as SubscribeBody;
  const subscription = await subscriptionService.subscribe(req.user!.id, body);
  sendSuccess(res, subscription, { message: 'Subscription activated' }, HttpStatus.CREATED);
});

export const current: RequestHandler = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.current(req.user!.id);
  sendSuccess(res, subscription, { message: 'Current subscription retrieved' });
});
