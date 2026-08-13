import { Router } from 'express';
import { asyncHandler } from '../core/async-handler.js';
import { sendError, sendSuccess } from '../common/response.js';
import { HttpStatus } from '../common/http-status.js';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/index.js';
import { authRouter } from '../modules/auth/routes/index.js';
import { userRouter } from '../modules/users/routes/index.js';
import { ownerRouter } from '../modules/owners/routes/index.js';
import { tenantRouter } from '../modules/tenants/routes/index.js';
import { boardingHouseRouter } from '../modules/boarding_houses/routes/index.js';
import { roomRouter } from '../modules/rooms/routes/index.js';
import { bookingRouter } from '../modules/bookings/routes/index.js';
import { paymentRouter } from '../modules/payments/routes/index.js';
import { subscriptionRouter } from '../modules/subscriptions/routes/index.js';
import { reviewRouter } from '../modules/reviews/routes/index.js';
import { favoriteRouter } from '../modules/favorites/routes/index.js';
import { notificationRouter } from '../modules/notifications/routes/index.js';
import { uploadRouter } from '../modules/uploads/routes/index.js';
import { analyticsRouter } from '../modules/analytics/routes/index.js';
import { adminRouter } from '../modules/admin/routes/index.js';

export const v1Router: Router = Router();

v1Router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    let database = 'up';
    let databaseError: string | undefined;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      database = 'down';
      databaseError = err instanceof Error ? err.message : String(err);
    }

    const health = {
      service: env.APP_NAME,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database,
    };

    if (database === 'down') {
      sendError(res, 'Service degraded: database unreachable', HttpStatus.SERVICE_UNAVAILABLE, {
        code: 'DEGRADED',
        errors: [databaseError],
      });
      return;
    }

    sendSuccess(res, health, { message: 'Health check passed' });
  }),
);

v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/owners', ownerRouter);
v1Router.use('/tenants', tenantRouter);
v1Router.use('/boarding-houses', boardingHouseRouter);
v1Router.use('/rooms', roomRouter);
v1Router.use('/bookings', bookingRouter);
v1Router.use('/payments', paymentRouter);
v1Router.use('/subscriptions', subscriptionRouter);
v1Router.use('/reviews', reviewRouter);
v1Router.use('/favorites', favoriteRouter);
v1Router.use('/notifications', notificationRouter);
v1Router.use('/uploads', uploadRouter);
v1Router.use('/owners/analytics', analyticsRouter);
v1Router.use('/admin', adminRouter);
