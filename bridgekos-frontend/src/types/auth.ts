export type Role = 'OWNER' | 'TENANT' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatar: string | null;
  phone: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  birthDate: string | null;
  address: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: UserStatus;
  createdAt: string;
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

export interface ApiError {
  success: boolean;
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
