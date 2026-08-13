import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { getById, getMe, updateMe } from '../controller/user.controller.js';
import { updateProfileSchema } from '../validator/user.validator.js';

export const userRouter: Router = Router();

userRouter.get('/me', authenticate, getMe);
userRouter.patch('/me', authenticate, validate({ body: updateProfileSchema }), updateMe);
userRouter.get('/:id', getById);
