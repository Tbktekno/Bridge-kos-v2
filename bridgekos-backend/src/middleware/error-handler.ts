import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { AppError, ValidationError } from '../core/errors.js';
import { HttpStatus } from '../common/http-status.js';
import { sendError } from '../common/response.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/index.js';

function isEntityTooLarge(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type?: string }).type === 'entity.too.large'
  );
}

function isBodyParseError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) return false;
  const candidate = err as unknown as { status?: number };
  return typeof candidate.status === 'number' && candidate.status === 400;
}

function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): void | AppError {
  switch (err.code) {
    case 'P2002':
      throw new AppError(
        'A record with the same unique value already exists',
        HttpStatus.CONFLICT,
        'DUPLICATE_ENTRY',
      );
    case 'P2025':
      throw new AppError('Requested record was not found', HttpStatus.NOT_FOUND, 'NOT_FOUND');
    case 'P2003':
      throw new AppError(
        'Referenced record does not exist',
        HttpStatus.BAD_REQUEST,
        'FOREIGN_KEY_VIOLATION',
      );
    case 'P2024':
      throw new AppError(
        'Database connection timeout',
        HttpStatus.SERVICE_UNAVAILABLE,
        'DB_TIMEOUT',
      );
    default:
      return void undefined;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 'Route not found', HttpStatus.NOT_FOUND, {
    code: 'NOT_FOUND',
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (!err.isOperational) logger.error({ err }, 'Unhandled operational error');
    sendError(res, err.message, err.statusCode, {
      code: err.code,
      ...(err.details !== undefined ? { errors: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    }));
    const validationError = new ValidationError(issues);
    sendError(res, validationError.message, validationError.statusCode, {
      code: validationError.code,
      errors: validationError.issues,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    try {
      const mapped = handlePrismaError(err);
      if (mapped) {
        sendError(res, mapped.message, mapped.statusCode, { code: mapped.code });
        return;
      }
    } catch (e) {
      if (e instanceof AppError) {
        sendError(res, e.message, e.statusCode, { code: e.code });
        return;
      }
    }
  }

  if (isEntityTooLarge(err)) {
    sendError(res, 'Payload too large', HttpStatus.BAD_REQUEST, { code: 'PAYLOAD_TOO_LARGE' });
    return;
  }

  if (isBodyParseError(err) || err instanceof SyntaxError) {
    sendError(res, 'Invalid JSON payload', HttpStatus.BAD_REQUEST, { code: 'INVALID_JSON' });
    return;
  }

  logger.error({ err }, 'Unhandled server error');
  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Unknown error';
  sendError(res, message, HttpStatus.INTERNAL_SERVER_ERROR, {
    code: 'INTERNAL_ERROR',
  });
}
