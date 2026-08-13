import type { Gender, Role, User, UserStatus } from '../../../generated/prisma/client.js';

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatar: string | null;
  phone: string | null;
  gender: Gender | null;
  birthDate: Date | null;
  address: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: UserStatus;
  createdAt: Date;
}

export function toUserProfileDto(user: User): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    gender: user.gender,
    birthDate: user.birthDate,
    address: user.address,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    status: user.status,
    createdAt: user.createdAt,
  };
}
