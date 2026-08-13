import { Router } from 'express';
import { Role } from '../../../generated/prisma/client.js';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { authorize } from '../../auth/middleware/authorize.js';
import { bookingTrend, occupancy, overview, revenue } from '../controller/analytics.controller.js';

export const analyticsRouter: Router = Router();

analyticsRouter.use(authenticate, authorize(Role.OWNER));

analyticsRouter.get('/overview', overview);
analyticsRouter.get('/revenue', revenue);
analyticsRouter.get('/occupancy', occupancy);
analyticsRouter.get('/booking-trend', bookingTrend);
