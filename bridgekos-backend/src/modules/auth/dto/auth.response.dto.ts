import type { User } from '../../../generated/prisma/client.js';
import type { AuthUser } from '../types/auth.types.js';

export function toAuthUserDto(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
  };
}
