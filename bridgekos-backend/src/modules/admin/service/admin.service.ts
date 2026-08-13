import { prisma } from '../../../utils/prisma.js';
import * as notificationService from '../../notifications/service/notification.service.js';
import { buildPaginationMeta, parsePagination } from '../../../common/pagination.js';
import {
  listBoardingHousesForAdmin,
  listOwners,
  listSubscriptions,
  listTenants,
  listUsers,
  moderateBoardingHouse,
  ownerByCity,
  revenueAggregate,
  topCities,
  updateOwnerVerification,
  userCount,
} from '../repository/admin.repository.js';
import type {
  AdminOverview,
  ModerateBoardingInput,
  ReviewVerificationInput,
} from '../types/admin.types.js';

export async function overview(): Promise<AdminOverview> {
  const [owners, tenants, boardingHouses, bookings, paid, cities, ownerCities] =
    await Promise.all([
      userCount({ role: 'OWNER' }),
      userCount({ role: 'TENANT' }),
      listBoardingHousesForAdmin({ skip: 0, take: 1 }).then((result) => result.total),
      prisma.booking.count({ where: { deletedAt: null } }),
      revenueAggregate(),
      topCities(5),
      ownerByCity(5),
    ]);

  return {
    totalOwners: owners,
    totalTenants: tenants,
    totalBoardingHouses: boardingHouses,
    totalBookings: bookings,
    platformRevenue: paid.platformRevenue,
    paidPayments: paid.paidPayments,
    topCities: cities,
    topOwnerCities: ownerCities,
  };
}

export async function listUsersForAdmin(query: Record<string, unknown>) {
  const pagination = parsePagination(query);
  const role = typeof query.role === 'string' ? query.role : undefined;
  const { items, total } = await listUsers({ role, skip: pagination.skip, take: pagination.take });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function listOwnersForAdmin(query: Record<string, unknown>) {
  const pagination = parsePagination(query);
  const { items, total } = await listOwners({ skip: pagination.skip, take: pagination.take });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function reviewOwnerVerification(
  adminId: string,
  ownerId: string,
  input: ReviewVerificationInput,
) {
  const updated = await updateOwnerVerification(ownerId, {
    verificationStatus: input.status,
    note: input.note ?? undefined,
    reviewedBy: adminId,
  });

  const owner = await prisma.owner.findUnique({ where: { id: ownerId }, select: { userId: true } });
  if (owner) {
    await notificationService.create(owner.userId, {
      type: 'VERIFICATION',
      title: `Verifikasi ${input.status === 'VERIFIED' ? 'disetujui' : 'ditolak'}`,
      body: input.note ?? undefined,
      channel: 'EMAIL',
    });
  }
  return updated;
}

export async function listBoardingHousesForAdminView(query: Record<string, unknown>) {
  const pagination = parsePagination(query);
  const status = typeof query.status === 'string' ? query.status : undefined;
  const { items, total } = await listBoardingHousesForAdmin({
    status,
    skip: pagination.skip,
    take: pagination.take,
  });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function moderateBoarding(houseId: string, input: ModerateBoardingInput) {
  return moderateBoardingHouse(houseId, input.status);
}

export async function listTenantsForAdmin(query: Record<string, unknown>) {
  const pagination = parsePagination(query);
  const { items, total } = await listTenants({ skip: pagination.skip, take: pagination.take });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function listSubscriptionsForAdmin(query: Record<string, unknown>) {
  const pagination = parsePagination(query);
  const { items, total } = await listSubscriptions({
    skip: pagination.skip,
    take: pagination.take,
  });
  return { items, total, meta: buildPaginationMeta(pagination, total) };
}

export async function analytics(): Promise<AdminOverview & { growth: { monthly: number } }> {
  return { ...(await overview()), growth: { monthly: 0 } };
}
