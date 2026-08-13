import { randomUUID } from 'node:crypto';
import { UserStatus } from '../../../generated/prisma/client.js';
import type { User } from '../../../generated/prisma/client.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../../core/errors.js';
import { hashPassword, verifyPassword } from '../../../utils/password.js';
import {
  accessTokenLifetimeMs,
  refreshTokenLifetimeMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../../utils/jwt.js';
import { generateRandomToken, hashToken } from '../../../utils/token.js';
import { clientUrl, mailer } from '../../../utils/mailer.js';
import {
  createUserWithRole,
  findUserByEmail,
  findUserById,
  markEmailVerified,
  updateUser,
} from '../../users/repository/user.repository.js';
import {
  createSession,
  findSessionById,
  revokeAllUserSessions,
  revokeSession,
} from '../repository/session.repository.js';
import {
  createVerificationToken,
  findNotExpiredToken,
  markTokenUsed,
} from '../repository/token.repository.js';
import { toAuthUserDto } from '../dto/auth.response.dto.js';
import type {
  AuthResult,
  LoginInput,
  RegisterInput,
  RequestContext,
  TokenPair,
} from '../types/auth.types.js';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const TOKEN_BYTES = 32;

function parseRefreshToken(refreshToken: string) {
  try {
    return verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }
}

function accessClaims(user: User) {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
  };
}

function ensureActive(user: User): void {
  if (user.status !== UserStatus.ACTIVE) {
    throw new ForbiddenError('Account is not active');
  }
}

async function sendEmailVerification(user: User): Promise<void> {
  const rawToken = generateRandomToken(TOKEN_BYTES);
  await createVerificationToken({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    type: 'EMAIL',
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;
  await mailer.send({
    to: user.email,
    subject: 'Verify your BridgeKos email',
    text: `Click the link below to verify your email address (valid for 24 hours).\n\n${verifyUrl}`,
  });
}

export async function register(input: RegisterInput, ctx: RequestContext): Promise<AuthResult> {
  const existing = await findUserByEmail(input.email);
  if (existing) throw new ConflictError('Email is already registered');

  const passwordHash = await hashPassword(input.password);
  const user = await createUserWithRole({
    email: input.email,
    passwordHash,
    fullName: input.fullName,
    role: input.role,
  });

  await sendEmailVerification(user);
  const tokens = await issueTokens(user, ctx);

  return { user: toAuthUserDto(user), tokens };
}

export async function login(input: LoginInput, ctx: RequestContext): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  ensureActive(user);
  const tokens = await issueTokens(user, ctx);

  void updateUser(user.id, { lastLoginAt: new Date() }).catch(() => undefined);

  return { user: toAuthUserDto(user), tokens };
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  const payload = parseRefreshToken(refreshToken);

  const session = await findSessionById(payload.jti);
  if (!session || session.revokedAt) throw new UnauthorizedError('Invalid refresh token');
  if (session.expiresAt < new Date()) {
    await revokeSession(session.id);
    throw new UnauthorizedError('Refresh token has expired');
  }

  // Token rotation: a replayed/old token no longer matches the stored hash.
  if (hashToken(refreshToken) !== session.refreshTokenHash) {
    await revokeSession(session.id);
    throw new UnauthorizedError('Refresh token reused or invalid');
  }

  const user = await findUserById(session.userId);
  if (!user) throw new UnauthorizedError('Account no longer exists');
  ensureActive(user);

  // Rotate: revoke the old session and issue a fresh one with a new id,
  // guaranteeing the returned refresh token differs from the presented one.
  await revokeSession(session.id);
  const newRefreshToken = await createRefreshTokenForUser(user, {
    userAgent: session.userAgent ?? undefined,
    ip: session.ipAddress ?? undefined,
  });

  return {
    accessToken: signAccessToken(accessClaims(user)),
    refreshToken: newRefreshToken,
    expiresIn: Math.floor(accessTokenLifetimeMs / 1000),
  };
}

export async function logout(refreshToken: string, userId: string): Promise<void> {
  const payload = parseRefreshToken(refreshToken);
  if (payload.sub !== userId) throw new ForbiddenError('Session does not belong to this account');

  const session = await findSessionById(payload.jti);
  if (session && !session.revokedAt) {
    await revokeSession(session.id);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) return;

  const rawToken = generateRandomToken(TOKEN_BYTES);
  await createVerificationToken({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    type: 'FORGOT_PASSWORD',
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
  await mailer.send({
    to: user.email,
    subject: 'Reset your BridgeKos password',
    text: `Use the link below to reset your password. This link expires in 24 hours.\n\n${resetUrl}`,
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
  ctx: RequestContext,
): Promise<AuthResult> {
  const record = await findNotExpiredToken(hashToken(token), 'FORGOT_PASSWORD');
  if (!record) throw new BadRequestError('Invalid or expired reset token');

  const user = await findUserById(record.userId);
  if (!user) throw new BadRequestError('Account not found');

  const passwordHash = await hashPassword(newPassword);
  await updateUser(user.id, { passwordHash, isPasswordChangeRequired: false });
  await markTokenUsed(record.id);
  await revokeAllUserSessions(user.id);

  const tokens = await issueTokens(user, ctx);
  return { user: toAuthUserDto(user), tokens };
}

export async function verifyEmail(token: string): Promise<void> {
  const record = await findNotExpiredToken(hashToken(token), 'EMAIL');
  if (!record) throw new BadRequestError('Invalid or expired verification token');

  await markEmailVerified(record.userId);
  await markTokenUsed(record.id);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await findUserById(userId);
  if (!user) throw new UnauthorizedError('Please sign in again');

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw new BadRequestError('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await updateUser(user.id, { passwordHash });
  await revokeAllUserSessions(user.id);
}

export async function me(userId: string): Promise<User> {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

async function createRefreshTokenForUser(user: User, ctx?: RequestContext): Promise<string> {
  const jti = randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  await createSession({
    id: jti,
    userId: user.id,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
    userAgent: ctx?.userAgent,
    ipAddress: ctx?.ip,
  });
  return refreshToken;
}

async function issueTokens(user: User, ctx: RequestContext): Promise<TokenPair> {
  const refreshToken = await createRefreshTokenForUser(user, ctx);

  return {
    accessToken: signAccessToken(accessClaims(user)),
    refreshToken,
    expiresIn: Math.floor(accessTokenLifetimeMs / 1000),
  };
}
