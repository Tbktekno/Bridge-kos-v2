import type { Prisma } from '../../../generated/prisma/client.js';
import { ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { findTenantByUserId, updateTenant } from '../repository/tenant.repository.js';
import type { UpdateTenantInput } from '../types/tenant.types.js';

export async function getTenantProfile(userId: string) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new ForbiddenError('Tenant profile not found');
  return tenant;
}

export async function updateTenantProfile(userId: string, input: UpdateTenantInput) {
  const tenant = await findTenantByUserId(userId);
  if (!tenant) throw new NotFoundError('Tenant profile not found');

  const data: {
    nickname?: string | null;
    emergencyContact?: string | null;
    preferences?: Prisma.InputJsonValue;
  } = {};
  if (input.nickname !== undefined) data.nickname = input.nickname;
  if (input.emergencyContact !== undefined) data.emergencyContact = input.emergencyContact;
  if (input.preferences !== undefined)
    data.preferences = input.preferences as Prisma.InputJsonValue;

  return updateTenant(tenant.id, data);
}
