import type { Request, RequestHandler, Response } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import * as tenantService from '../service/tenant.service.js';
import type { UpdateTenantBody } from '../validator/tenant.validator.js';

export const getMe: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenant = await tenantService.getTenantProfile(req.user!.id);
  sendSuccess(res, tenant, { message: 'Tenant profile retrieved' });
});

export const updateMe: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateTenantBody;
  const tenant = await tenantService.updateTenantProfile(req.user!.id, body);
  sendSuccess(res, tenant, { message: 'Tenant profile updated' });
});
