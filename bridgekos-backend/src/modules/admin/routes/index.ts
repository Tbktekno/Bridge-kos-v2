import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import {
  analytics,
  listBoardingHouses,
  listOwners,
  listSubscriptions,
  listTenants,
  listUsers,
  moderateBoarding,
  overview,
  reviewVerification,
} from '../controller/admin.controller.js';
import {
  adminListQuerySchema,
  moderateBoardingSchema,
  reviewVerificationSchema,
} from '../validator/admin.validator.js';

export const adminRouter: Router = Router();

adminRouter.use(authenticate, authorize(Role.ADMIN));

adminRouter.get('/overview', overview);
adminRouter.get('/analytics', analytics);
adminRouter.get('/users', validate({ query: adminListQuerySchema }), listUsers);
adminRouter.get('/owners', validate({ query: adminListQuerySchema }), listOwners);
adminRouter.patch(
  '/owners/:ownerId/verification',
  validate({ body: reviewVerificationSchema }),
  reviewVerification,
);
adminRouter.get('/boarding-houses', validate({ query: adminListQuerySchema }), listBoardingHouses);
adminRouter.patch(
  '/boarding-houses/:houseId/moderation',
  validate({ body: moderateBoardingSchema }),
  moderateBoarding,
);
adminRouter.get('/tenants', validate({ query: adminListQuerySchema }), listTenants);
adminRouter.get('/subscriptions', validate({ query: adminListQuerySchema }), listSubscriptions);
