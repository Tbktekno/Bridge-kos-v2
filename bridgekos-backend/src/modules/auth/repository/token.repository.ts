import { prisma } from '../../../utils/prisma.js';

export type VerificationTokenType = 'EMAIL' | 'PHONE' | 'FORGOT_PASSWORD';

export interface CreateTokenInput {
  userId: string;
  tokenHash: string;
  type: VerificationTokenType;
  expiresAt: Date;
}

export async function createVerificationToken(input: CreateTokenInput) {
  return prisma.emailVerificationToken.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      type: input.type,
      expiresAt: input.expiresAt,
    },
  });
}

export async function findNotExpiredToken(tokenHash: string, type: VerificationTokenType) {
  return prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash,
      type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function markTokenUsed(id: string) {
  return prisma.emailVerificationToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}
