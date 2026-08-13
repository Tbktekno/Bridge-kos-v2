import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role, UserStatus } from '../generated/prisma/client.js';
import { env } from '../config/index.js';
import { parseDurationToMs } from './duration.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  status: UserStatus;
  isEmailVerified: boolean;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

type AccessTokenClaims = Omit<AccessTokenPayload, 'type'>;
type RefreshTokenClaims = Omit<RefreshTokenPayload, 'type'>;

const accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'];
const refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'];

export function signAccessToken(claims: AccessTokenClaims): string {
  return jwt.sign({ ...claims, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: accessExpiresIn,
  });
}

export function signRefreshToken(claims: RefreshTokenClaims): string {
  return jwt.sign({ ...claims, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpiresIn,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  return decoded as unknown as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  return decoded as unknown as RefreshTokenPayload;
}

export const accessTokenLifetimeMs = parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN);
export const refreshTokenLifetimeMs = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);
