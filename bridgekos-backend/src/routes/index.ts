import { Router } from 'express';
import { v1Router } from './v1.js';
import { env } from '../config/index.js';

export const apiRouter: Router = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

apiRouter.use(env.API_PREFIX, v1Router);
