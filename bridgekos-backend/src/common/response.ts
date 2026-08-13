import type { Response } from 'express';
import { HttpStatus } from './http-status.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface SuccessOptions {
  message?: string;
  meta?: PaginationMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: SuccessOptions = {},
  statusCode: number = HttpStatus.OK,
): Response {
  const body: Record<string, unknown> = {
    success: true,
    message: options.message ?? 'Success',
    data,
  };
  if (options.meta) body.meta = options.meta;
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number,
  options: { errors?: unknown; code?: string } = {},
): Response {
  const body: Record<string, unknown> = {
    success: false,
    message,
  };
  if (options.code) body.code = options.code;
  if (options.errors !== undefined) body.errors = options.errors;
  return res.status(statusCode).json(body);
}
