import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../utils/prisma.js';

export async function createBankAccount(
  ownerId: string,
  data: Omit<Prisma.BankAccountUncheckedCreateInput, 'ownerId'>,
) {
  return prisma.bankAccount.create({
    data: { ...data, ownerId },
  });
}

export async function findBankAccountById(id: string) {
  return prisma.bankAccount.findUnique({ where: { id } });
}

export async function listBankAccountsByOwner(ownerId: string) {
  return prisma.bankAccount.findMany({
    where: { ownerId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function updateBankAccount(id: string, data: Prisma.BankAccountUncheckedUpdateInput) {
  return prisma.bankAccount.update({ where: { id }, data });
}

export async function deleteBankAccount(id: string) {
  return prisma.bankAccount.delete({ where: { id } });
}

export async function setAllBankAccountsNonPrimary(ownerId: string) {
  return prisma.bankAccount.updateMany({
    where: { ownerId },
    data: { isPrimary: false },
  });
}

export async function createOwnerVerification(
  ownerId: string,
  data: { identityPhotoUrl?: string; businessLicenseUrl?: string },
) {
  return prisma.ownerVerification.create({
    data: {
      ownerId,
      identityPhotoUrl: data.identityPhotoUrl ?? null,
      businessLicenseUrl: data.businessLicenseUrl ?? null,
    },
  });
}
