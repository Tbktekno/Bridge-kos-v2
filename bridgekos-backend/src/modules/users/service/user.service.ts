import type { Prisma } from '../../../generated/prisma/client.js';
import { NotFoundError } from '../../../core/errors.js';
import { findUserById, updateUser } from '../repository/user.repository.js';
import { toUserProfileDto } from '../dto/user.response.dto.js';
import type { UpdateProfileInput } from '../types/user.types.js';

export async function getProfile(userId: string) {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  return toUserProfileDto(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const existing = await findUserById(userId);
  if (!existing) throw new NotFoundError('User not found');

  const data: Prisma.UserUpdateInput = {};
  if (input.fullName !== undefined) data.fullName = input.fullName;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.gender !== undefined) data.gender = input.gender;
  if (input.birthDate !== undefined) data.birthDate = input.birthDate;
  if (input.address !== undefined) data.address = input.address;
  if (input.avatar !== undefined) data.avatar = input.avatar;

  const user = await updateUser(userId, data);
  return toUserProfileDto(user);
}

export async function getPublicProfile(userId: string) {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  return {
    id: user.id,
    fullName: user.fullName,
    avatar: user.avatar,
    role: user.role,
  };
}
