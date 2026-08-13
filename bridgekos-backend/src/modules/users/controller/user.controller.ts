import { str } from '../../../utils/http.js';
import type { Request, RequestHandler, Response } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import * as userService from '../service/user.service.js';
import type { UpdateProfileBody } from '../validator/user.validator.js';

export const getMe: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.getProfile(req.user!.id);
  sendSuccess(res, profile, { message: 'Profile retrieved' });
});

export const updateMe: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as UpdateProfileBody;
  const profile = await userService.updateProfile(req.user!.id, {
    fullName: body.fullName,
    phone: body.phone ?? undefined,
    gender: body.gender ?? undefined,
    birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
    address: body.address ?? undefined,
    avatar: body.avatar ?? undefined,
  });
  sendSuccess(res, profile, { message: 'Profile updated' });
});

export const getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.getPublicProfile(str(req.params.id));
  sendSuccess(res, profile);
});
