import type { RequestHandler } from 'express';
import type { Role } from '../../../generated/prisma/client.js';
import { ForbiddenError, UnauthorizedError } from '../../../core/errors.js';

export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
