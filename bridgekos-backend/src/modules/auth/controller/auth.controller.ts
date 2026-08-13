import type { Request, RequestHandler, Response } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import * as authService from '../service/auth.service.js';
import { toAuthUserDto } from '../dto/auth.response.dto.js';
import { toUserProfileDto } from '../../users/dto/user.response.dto.js';
import type { RequestContext } from '../types/auth.types.js';

function requestContext(req: Request): RequestContext {
  return {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };
}

export const register: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body, requestContext(req));
  sendSuccess(res, result, { message: 'Account created successfully' }, HttpStatus.CREATED);
});

export const login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, requestContext(req));
  sendSuccess(res, result, { message: 'Login successful' });
});

export const refresh: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, tokens, { message: 'Tokens refreshed' });
});

export const logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken, req.user!.id);
  sendSuccess(res, null, { message: 'Logged out successfully' });
});

export const forgotPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, {
    message: 'If the email is registered, a password reset link has been sent',
  });
});

export const resetPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(
    req.body.token,
    req.body.newPassword,
    requestContext(req),
  );
  sendSuccess(res, result, { message: 'Password reset successfully' });
});

export const verifyEmail: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, null, { message: 'Email verified successfully' });
});

export const changePassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  sendSuccess(res, null, { message: 'Password changed successfully' });
});

export const me: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.me(req.user!.id);
  sendSuccess(res, {
    auth: toAuthUserDto(user),
    profile: toUserProfileDto(user),
  });
});
