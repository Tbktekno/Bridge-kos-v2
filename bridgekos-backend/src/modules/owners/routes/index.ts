import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import {
  addBankAccount,
  getMe,
  listBankAccounts,
  removeBankAccount,
  submitVerification,
  updateBankAccount,
  updateMe,
} from '../controller/owner.controller.js';
import {
  createBankAccountSchema,
  submitVerificationSchema,
  updateBankAccountSchema,
  updateOwnerSchema,
} from '../validator/owner.validator.js';

export const ownerRouter: Router = Router();

ownerRouter.use(authenticate, authorize(Role.OWNER));

ownerRouter.get('/me', getMe);
ownerRouter.patch('/me', validate({ body: updateOwnerSchema }), updateMe);

ownerRouter.get('/me/bank-accounts', listBankAccounts);
ownerRouter.post('/me/bank-accounts', validate({ body: createBankAccountSchema }), addBankAccount);
ownerRouter.patch(
  '/me/bank-accounts/:id',
  validate({ body: updateBankAccountSchema }),
  updateBankAccount,
);
ownerRouter.delete('/me/bank-accounts/:id', removeBankAccount);

ownerRouter.post(
  '/me/verification',
  validate({ body: submitVerificationSchema }),
  submitVerification,
);
