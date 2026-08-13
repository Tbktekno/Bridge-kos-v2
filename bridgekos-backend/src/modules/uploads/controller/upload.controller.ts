import multer from 'multer';
import type { Request, RequestHandler } from 'express';
import { asyncHandler } from '../../../core/async-handler.js';
import { sendSuccess } from '../../../common/response.js';
import { HttpStatus } from '../../../common/http-status.js';
import { BadRequestError } from '../../../core/errors.js';
import { saveUpload } from '../service/upload.service.js';

export function createUploadHandler(field: string, folder: string): RequestHandler[] {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  return [
    upload.single(field),
    asyncHandler(async (req: Request, res) => {
      if (!req.file) throw new BadRequestError('No file uploaded');
      const url = await saveUpload({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        folder,
      });
      sendSuccess(res, { url }, { message: 'File uploaded' }, HttpStatus.CREATED);
    }),
  ];
}
