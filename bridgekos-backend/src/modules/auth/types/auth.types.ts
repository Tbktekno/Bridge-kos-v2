import type { Role, UserStatus } from '../../../generated/prisma/client.js';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: AuthUser;
  tokens: TokenPair;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RequestContext {
  userAgent?: string;
  ip?: string;
}
