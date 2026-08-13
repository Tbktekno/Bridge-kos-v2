import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import {
  confirmPaid,
  detail,
  detailByBooking,
  listByOwner,
  listMine,
  refund,
  uploadReceipt,
} from '../controller/payment.controller.js';
import { listPaymentsQuerySchema, uploadReceiptSchema } from '../validator/payment.validator.js';

export const paymentRouter: Router = Router();

paymentRouter.use(authenticate);

paymentRouter.get(
  '/me',
  authorize(Role.TENANT),
  validate({ query: listPaymentsQuerySchema }),
  listMine,
);
paymentRouter.get(
  '/owner/me',
  authorize(Role.OWNER),
  validate({ query: listPaymentsQuerySchema }),
  listByOwner,
);
paymentRouter.get('/booking/:bookingId', detailByBooking);
paymentRouter.post(
  '/:id/upload-receipt',
  authorize(Role.TENANT),
  validate({ body: uploadReceiptSchema }),
  uploadReceipt,
);
paymentRouter.patch('/:id/confirm-paid', authorize(Role.OWNER), confirmPaid);
paymentRouter.patch('/:id/refund', authorize(Role.OWNER), refund);
paymentRouter.get('/:id', detail);
