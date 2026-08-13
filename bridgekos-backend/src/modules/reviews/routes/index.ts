import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import { create, listByHouse, listMine, reply } from '../controller/review.controller.js';
import {
  createReplySchema,
  createReviewSchema,
  listReviewsQuerySchema,
} from '../validator/review.validator.js';

export const reviewRouter: Router = Router();

reviewRouter.get(
  '/house/:boardingHouseId',
  validate({ query: listReviewsQuerySchema }),
  listByHouse,
);

reviewRouter.use(authenticate);

reviewRouter.post('/', authorize(Role.TENANT), validate({ body: createReviewSchema }), create);
reviewRouter.get('/me', authorize(Role.TENANT), listMine);
reviewRouter.post(
  '/:id/reply',
  authorize(Role.OWNER),
  validate({ body: createReplySchema }),
  reply,
);
