import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { env } from '../config/index.js';
import { BadRequestError } from '../core/errors.js';
import { logger } from './logger.js';

export interface StorageDriver {
  save(input: {
    buffer: Buffer;
    mimeType: string;
    folder: string;
    extension: string;
  }): Promise<string>;
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

export function isAllowedMime(mimeType: string): boolean {
  return ALLOWED_MIME.has(mimeType);
}

class LocalStorageDriver implements StorageDriver {
  async save(input: {
    buffer: Buffer;
    mimeType: string;
    folder: string;
    extension: string;
  }): Promise<string> {
    const root = path.resolve(process.cwd(), env.UPLOAD_DIR.replace(/^\.\//, ''));
    const key = `${input.folder}/${Date.now()}-${randomBytes(6).toString('hex')}${input.extension}`;
    const target = path.join(root, key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, input.buffer);
    return `/${key}`;
  }
}

function createDriver(): StorageDriver {
  if (env.STORAGE_DRIVER === 'local') {
    logger.info('Storage driver: local');
    return new LocalStorageDriver();
  }
  // S3/R2/MinIO driver can be added here without touching callers.
  throw new BadRequestError('Storage driver not configured');
}

export const storageDriver = createDriver();

export function extensionFor(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'application/pdf':
      return '.pdf';
    default:
      return '.bin';
  }
}
