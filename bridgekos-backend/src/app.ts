import path from 'node:path';
import express, { type Express } from 'express';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { apiLimiter, corsMiddleware, securityHeaders } from './middleware/security.js';
import { httpLogger } from './utils/logger.js';
import { env } from './config/index.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(httpLogger);
  app.use(env.API_PREFIX, apiLimiter);

  app.use(
    '/uploads',
    express.static(path.resolve(process.cwd(), env.UPLOAD_DIR.replace(/^\.\//, ''))),
  );

  app.use(apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
