import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { findTenantByUserId } from '../../tenants/repository/tenant.repository.js';
import { findBoardingHouseById } from '../../boarding_houses/repository/boarding-house.repository.js';
import {
  createFavorite,
  deleteFavorite,
  findFavorite,
  listFavoritesByTenant,
} from '../repository/favorite.repository.js';

export async function add(userId: string, boardingHouseId: string) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Only tenants can favorite boarding houses');

  const house = await findBoardingHouseById(boardingHouseId);
  if (!house || house.deletedAt || house.status !== 'PUBLISHED') {
    throw new NotFoundError('Boarding house not found');
  }
  const existing = await findFavorite(tenant.id, boardingHouseId);
  if (existing) throw new ConflictError('Boarding house already in your favorites');

  return createFavorite(tenant.id, boardingHouseId);
}

export async function remove(userId: string, boardingHouseId: string) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Tenant profile not found');
  await deleteFavorite(tenant.id, boardingHouseId);
}

export async function list(userId: string) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Tenant profile not found');
  return listFavoritesByTenant(tenant.id);
}
