import { BadRequestError } from '../../../core/errors.js';
import {
  extensionFor as extensionForMime,
  isAllowedMime,
  storageDriver,
} from '../../../utils/storage.js';

export const UPLOAD_FOLDERS = {
  avatar: 'avatars',
  gallery: 'gallery',
  receipt: 'receipts',
  identity: 'identity',
} as const;

export async function saveUpload(input: {
  buffer: Buffer;
  mimeType: string;
  folder: string;
}): Promise<string> {
  if (!isAllowedMime(input.mimeType)) {
    throw new BadRequestError(`File type not allowed: ${input.mimeType}`);
  }
  return storageDriver.save({
    buffer: input.buffer,
    mimeType: input.mimeType,
    folder: input.folder,
    extension: extensionForMime(input.mimeType),
  });
}
