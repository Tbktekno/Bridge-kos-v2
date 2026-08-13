import type { PaginationMeta } from '../common/response.js';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function parsePagination(query: object = {}): PaginationParams {
  const q = query as Record<string, unknown>;
  const rawPage = Number(q.page ?? DEFAULT_PAGE);
  const rawLimit = Number(q.limit ?? DEFAULT_LIMIT);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  const limitOut = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : DEFAULT_LIMIT;
  const limit = Math.min(limitOut, MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildPaginationMeta(params: PaginationParams, totalItems: number): PaginationMeta {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / params.limit);
  return {
    page: params.page,
    limit: params.limit,
    totalItems,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1 && totalPages > 0,
  };
}

export function parseStringList(value: unknown): string[] {
  if (typeof value !== 'string' || value.length === 0) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
