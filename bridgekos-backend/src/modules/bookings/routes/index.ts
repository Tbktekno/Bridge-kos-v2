import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import {
  cancel,
  complete,
  confirm,
  create,
  detail,
  listByOwner,
  listMine,
  reject,
} from '../controller/booking.controller.js';
import { createBookingSchema, listBookingsQuerySchema } from '../validator/booking.validator.js';

export const bookingRouter: Router = Router();

bookingRouter.use(authenticate);

bookingRouter.post('/', authorize(Role.TENANT), validate({ body: createBookingSchema }), create);
bookingRouter.get(
  '/me',
  authorize(Role.TENANT),
  validate({ query: listBookingsQuerySchema }),
  listMine,
);
bookingRouter.get(
  '/owner/me',
  authorize(Role.OWNER),
  validate({ query: listBookingsQuerySchema }),
  listByOwner,
);
bookingRouter.post('/:id/cancel', authorize(Role.TENANT), cancel);
bookingRouter.patch('/:id/confirm', authorize(Role.OWNER), confirm);
bookingRouter.patch('/:id/reject', authorize(Role.OWNER), reject);
bookingRouter.patch('/:id/complete', authorize(Role.OWNER), complete);
bookingRouter.get('/:id', detail);
