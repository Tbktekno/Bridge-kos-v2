import { Router } from 'express';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { createUploadHandler } from '../controller/upload.controller.js';

export const uploadRouter: Router = Router();

uploadRouter.use(authenticate);

uploadRouter.post('/avatar', createUploadHandler('avatar', 'avatars'));
uploadRouter.post('/gallery', createUploadHandler('image', 'gallery'));
uploadRouter.post('/receipt', createUploadHandler('receipt', 'receipts'));
uploadRouter.post('/identity', createUploadHandler('document', 'identity'));
