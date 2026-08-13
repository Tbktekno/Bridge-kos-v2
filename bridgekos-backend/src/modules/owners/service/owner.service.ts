import type { Prisma } from '../../../generated/prisma/client.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../core/errors.js';
import {
  findOwnerByUserId,
  findOwnerByUserIdWithDetails,
  updateOwner,
} from '../repository/owner.repository.js';
import {
  createBankAccount,
  createOwnerVerification,
  deleteBankAccount,
  findBankAccountById,
  listBankAccountsByOwner,
  setAllBankAccountsNonPrimary,
  updateBankAccount,
} from '../repository/owner-account.repository.js';
import type {
  CreateBankAccountInput,
  SubmitVerificationInput,
  UpdateOwnerInput,
} from '../types/owner.types.js';

export async function getOwnerProfile(userId: string) {
  const owner = await findOwnerByUserIdWithDetails(userId);
  if (!owner) throw new NotFoundError('Owner profile not found');
  return owner;
}

export async function updateOwnerProfile(userId: string, input: UpdateOwnerInput) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new NotFoundError('Owner profile not found');

  const data: Prisma.OwnerUpdateInput = {};
  if (input.businessName !== undefined) data.businessName = input.businessName;
  if (input.businessDescription !== undefined) data.businessDescription = input.businessDescription;
  if (input.logo !== undefined) data.logo = input.logo;
  if (input.whatsappNumber !== undefined) data.whatsappNumber = input.whatsappNumber;

  return updateOwner(owner.id, data);
}

export async function listBankAccounts(userId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new NotFoundError('Owner profile not found');
  return listBankAccountsByOwner(owner.id);
}

export async function addBankAccount(userId: string, input: CreateBankAccountInput) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new NotFoundError('Owner profile not found');

  if (input.isPrimary) {
    await setAllBankAccountsNonPrimary(owner.id);
  }
  return createBankAccount(owner.id, {
    bankName: input.bankName,
    accountNumber: input.accountNumber,
    accountHolderName: input.accountHolderName,
    isPrimary: input.isPrimary ?? false,
  });
}

export async function updateBankAccountById(
  userId: string,
  accountId: string,
  input: Partial<CreateBankAccountInput>,
) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new NotFoundError('Owner profile not found');

  const account = await findBankAccountById(accountId);
  if (!account || account.ownerId !== owner.id) throw new NotFoundError('Bank account not found');

  if (input.isPrimary) {
    await setAllBankAccountsNonPrimary(owner.id);
  }
  const data: Prisma.BankAccountUncheckedUpdateInput = {};
  if (input.bankName !== undefined) data.bankName = input.bankName;
  if (input.accountNumber !== undefined) data.accountNumber = input.accountNumber;
  if (input.accountHolderName !== undefined) data.accountHolderName = input.accountHolderName;
  if (input.isPrimary !== undefined) data.isPrimary = input.isPrimary;

  return updateBankAccount(accountId, data);
}

export async function removeBankAccount(userId: string, accountId: string) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new NotFoundError('Owner profile not found');

  const account = await findBankAccountById(accountId);
  if (!account || account.ownerId !== owner.id) throw new ForbiddenError('Bank account not found');

  await deleteBankAccount(accountId);
}

export async function submitVerification(userId: string, input: SubmitVerificationInput) {
  const owner = await findOwnerByUserId(userId);
  if (!owner) throw new NotFoundError('Owner profile not found');
  if (owner.verificationStatus === 'VERIFIED') {
    throw new BadRequestError('Owner is already verified');
  }
  return createOwnerVerification(owner.id, input);
}
