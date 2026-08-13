import type { VerificationStatus } from '../../../generated/prisma/client.js';

export interface UpdateOwnerInput {
  businessName?: string;
  businessDescription?: string | null;
  logo?: string | null;
  whatsappNumber?: string | null;
}

export interface CreateBankAccountInput {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isPrimary?: boolean;
}

export interface SubmitVerificationInput {
  identityPhotoUrl?: string;
  businessLicenseUrl?: string;
}

export interface OwnerSummaryDto {
  id: string;
  businessName: string | null;
  businessDescription: string | null;
  logo: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: Date | null;
}
