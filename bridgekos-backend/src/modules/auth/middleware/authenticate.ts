import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../../../utils/jwt.js';
import { ForbiddenError, UnauthorizedError } from '../../../core/errors.js';
import { UserStatus } from '../../../generated/prisma/client.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing bearer token'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    next(new UnauthorizedError('Missing bearer token'));
    return;
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
    return;
  }

  if (payload.status !== UserStatus.ACTIVE) {
    next(new ForbiddenError('Account is not active'));
    return;
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    status: payload.status,
    isEmailVerified: payload.isEmailVerified,
  };
  next();
};
