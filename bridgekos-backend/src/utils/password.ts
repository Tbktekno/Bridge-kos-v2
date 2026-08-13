import argon2 from 'argon2';
import { env } from '../config/index.js';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: env.PASSWORD_HASH_MEMORY,
    timeCost: env.PASSWORD_HASH_TIME,
    parallelism: env.PASSWORD_HASH_PARALLELISM,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
