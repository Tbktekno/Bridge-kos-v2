import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword,
  verifyEmail,
} from '../controller/auth.controller.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validator/auth.validator.js';

export const authRouter: Router = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.post('/refresh', validate({ body: refreshTokenSchema }), refresh);
authRouter.post('/forgot-password', validate({ body: forgotPasswordSchema }), forgotPassword);
authRouter.post('/reset-password', validate({ body: resetPasswordSchema }), resetPassword);
authRouter.post('/verify-email', validate({ body: verifyEmailSchema }), verifyEmail);

authRouter.post('/logout', authenticate, validate({ body: logoutSchema }), logout);
authRouter.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  changePassword,
);
authRouter.get('/me', authenticate, me);
