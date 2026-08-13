import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import { getMe, updateMe } from '../controller/tenant.controller.js';
import { updateTenantSchema } from '../validator/tenant.validator.js';

export const tenantRouter: Router = Router();

tenantRouter.use(authenticate, authorize(Role.TENANT));

tenantRouter.get('/me', getMe);
tenantRouter.patch('/me', validate({ body: updateTenantSchema }), updateMe);
