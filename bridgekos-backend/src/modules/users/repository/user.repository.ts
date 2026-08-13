import type { Prisma } from '../../../generated/prisma/client.js';
import { Role } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export interface CreateUserWithRoleInput {
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
}

function createRoleProfile(
  tx: Prisma.TransactionClient,
  userId: string,
  role: Role,
): Promise<unknown> {
  switch (role) {
    case Role.OWNER:
      return tx.owner.create({ data: { userId } });
    case Role.TENANT:
      return tx.tenant.create({ data: { userId } });
    default:
      return Promise.resolve(null);
  }
}

export async function createUserWithRole(input: CreateUserWithRoleInput) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        fullName: input.fullName,
        role: input.role,
      },
    });
    await createRoleProfile(tx, user.id, input.role);
    return user;
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({ where: { id }, data });
}

export async function markEmailVerified(id: string) {
  return prisma.user.update({
    where: { id },
    data: { isEmailVerified: true },
  });
}
