import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../core/errors.js';
import { prisma } from '../../../utils/prisma.js';
import { findTenantByUserId } from '../../tenants/repository/tenant.repository.js';
import { findOwnerByUserId } from '../../owners/repository/owner.repository.js';
import {
  countUserReview,
  createReview,
  createReviewReply,
  findReviewById,
  listReviewsByHouse,
  listReviewsByTenant,
  recomputeRating,
} from '../repository/review.repository.js';
import { buildPaginationMeta, parsePagination } from '../../../common/pagination.js';
import type { CreateReviewInput, CreateReplyInput } from '../types/review.types.js';

export async function create(userId: string, input: CreateReviewInput) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Only tenants can review boarding houses');

  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, tenantId: tenant.id, status: 'COMPLETED', deletedAt: null },
    include: { room: { select: { boardingHouseId: true } } },
  });
  if (!booking) throw new BadRequestError('A completed booking is required to review this house');

  const boardingHouseId = booking.room.boardingHouseId;
  const existing = await countUserReview(tenant.id, boardingHouseId);
  if (existing > 0) throw new ConflictError('You have already reviewed this boarding house');

  const review = await createReview({
    tenantId: tenant.id,
    bookingId: input.bookingId,
    boardingHouseId,
    rating: input.rating,
    comment: input.comment ?? null,
    photo: input.photo ?? null,
  });
  await recomputeRating(boardingHouseId);
  return review;
}

export async function listByHouse(boardingHouseId: string, query: Record<string, unknown>) {
  const pagination = parsePagination(query);
  const { items, total } = await listReviewsByHouse(boardingHouseId, {
    skip: pagination.skip,
    take: pagination.take,
  });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function listMine(userId: string) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Tenant profile not found');
  return listReviewsByTenant(tenant.id);
}

export async function reply(userId: string, reviewId: string, input: CreateReplyInput) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new ForbiddenError('Only owners can reply to reviews');

  const review = await findReviewById(reviewId);
  if (!review) throw new NotFoundError('Review not found');

  const house = await prisma.boardingHouse.findUnique({
    where: { id: review.boardingHouseId },
    select: { ownerId: true },
  });
  if (!house || house.ownerId !== owner.id)
    throw new ForbiddenError('Review is not for your boarding house');
  if (review.reply) throw new ConflictError('Review already has a reply');

  return createReviewReply(reviewId, owner.id, input.comment);
}
