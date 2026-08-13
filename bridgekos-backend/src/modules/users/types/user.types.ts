import type { Gender } from '../../../generated/prisma/client.js';

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  gender?: Gender;
  birthDate?: Date;
  address?: string;
  avatar?: string;
}
