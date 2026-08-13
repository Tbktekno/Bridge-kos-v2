import { createHash, randomBytes } from 'node:crypto';

export function generateRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateOtp(length = 6): string {
  const bytes = randomBytes(length);
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += (bytes[i]! % 10).toString();
  }
  return otp;
}
