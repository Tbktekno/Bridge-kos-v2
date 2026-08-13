import { HttpStatus } from '../common/http-status.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code = 'INTERNAL_ERROR',
    options: { isOperational?: boolean; details?: unknown; cause?: unknown } = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options.isOperational ?? statusCode < 500;
    this.details = options.details;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST', { details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, HttpStatus.CONFLICT, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  public readonly issues: Array<{ field: string; message: string }>;

  constructor(issues: Array<{ field: string; message: string }>) {
    super('Validation failed', HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', {
      details: issues,
    });
    this.issues = issues;
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMITED');
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE', {
      isOperational: false,
    });
  }
}
