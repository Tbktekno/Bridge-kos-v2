import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { validate } from '../../../middleware/validate.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import { current, plans, subscribe } from '../controller/subscription.controller.js';
import { subscribeSchema } from '../validator/subscription.validator.js';

export const subscriptionRouter: Router = Router();

subscriptionRouter.get('/plans', plans);

subscriptionRouter.use(authenticate, authorize(Role.OWNER));

subscriptionRouter.post('/', validate({ body: subscribeSchema }), subscribe);
subscriptionRouter.get('/me', current);
