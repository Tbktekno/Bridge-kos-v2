import { prisma } from '../../../utils/prisma.js';

export interface CreateSessionInput {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export async function createSession(input: CreateSessionInput) {
  return prisma.session.create({
    data: {
      id: input.id,
      userId: input.userId,
      refreshTokenHash: input.refreshTokenHash,
      expiresAt: input.expiresAt,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
    },
  });
}

export async function findSessionById(id: string) {
  return prisma.session.findUnique({ where: { id } });
}

export async function findSessionByTokenHash(refreshTokenHash: string) {
  return prisma.session.findFirst({
    where: { refreshTokenHash, revokedAt: null },
  });
}

export async function updateSessionToken(
  id: string,
  data: { refreshTokenHash: string; expiresAt: Date },
) {
  return prisma.session.update({
    where: { id },
    data: {
      refreshTokenHash: data.refreshTokenHash,
      expiresAt: data.expiresAt,
      lastUsedAt: new Date(),
    },
  });
}

export async function revokeSession(id: string) {
  return prisma.session.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserSessions(userId: string) {
  return prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
