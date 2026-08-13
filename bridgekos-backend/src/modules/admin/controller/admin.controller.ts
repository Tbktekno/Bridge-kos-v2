import { str } from '../../../utils/http.js';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import * as adminService from '../service/admin.service.js';
import type { ModerateBoardingBody, ReviewVerificationBody } from '../validator/admin.validator.js';

export const overview: RequestHandler = asyncHandler(async (_req, res) => {
  const data = await adminService.overview();
  sendSuccess(res, data, { message: 'Admin overview retrieved' });
});

export const listUsers: RequestHandler = asyncHandler(async (req, res) => {
  const result = await adminService.listUsersForAdmin(req.query);
  sendSuccess(res, result.items, { message: 'Users retrieved', meta: result.meta });
});

export const listOwners: RequestHandler = asyncHandler(async (req, res) => {
  const result = await adminService.listOwnersForAdmin(req.query);
  sendSuccess(res, result.items, { message: 'Owners retrieved', meta: result.meta });
});

export const reviewVerification: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as ReviewVerificationBody;
  const owner = await adminService.reviewOwnerVerification(
    req.user!.id,
    str(req.params.ownerId),
    body,
  );
  sendSuccess(res, owner, { message: 'Owner verification updated' });
});

export const listBoardingHouses: RequestHandler = asyncHandler(async (req, res) => {
  const result = await adminService.listBoardingHousesForAdminView(req.query);
  sendSuccess(res, result.items, { message: 'Boarding houses retrieved', meta: result.meta });
});

export const moderateBoarding: RequestHandler = asyncHandler(async (req, res) => {
  const body = req.body as ModerateBoardingBody;
  const house = await adminService.moderateBoarding(str(req.params.houseId), body);
  sendSuccess(res, house, { message: 'Boarding house moderation updated' });
});

export const listTenants: RequestHandler = asyncHandler(async (req, res) => {
  const result = await adminService.listTenantsForAdmin(req.query);
  sendSuccess(res, result.items, { message: 'Tenants retrieved', meta: result.meta });
});

export const listSubscriptions: RequestHandler = asyncHandler(async (req, res) => {
  const result = await adminService.listSubscriptionsForAdmin(req.query);
  sendSuccess(res, result.items, { message: 'Subscriptions retrieved', meta: result.meta });
});

export const analytics: RequestHandler = asyncHandler(async (_req, res) => {
  const data = await adminService.analytics();
  sendSuccess(res, data, { message: 'Platform analytics retrieved' });
});
