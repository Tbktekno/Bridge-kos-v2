import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';
import { rateLimit, type RateLimitRequestHandler } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { corsOrigins, env } from '../config/index.js';
import { HttpStatus } from '../common/http-status.js';
import { sendError } from '../common/response.js';
import { TooManyRequestsError } from '../core/errors.js';
import { logger } from '../utils/logger.js';

export const securityHeaders: RequestHandler = helmet();

function normalizeOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = 'localhost';
    }
    return url.origin;
  } catch {
    return origin;
  }
}

const allowedOrigins = corsOrigins.map(normalizeOrigin);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(normalizeOrigin(origin))
    ) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

export const corsMiddleware: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(normalizeOrigin(origin))) {
    logger.warn({ origin }, 'Request from disallowed origin');
    sendError(res, 'Origin not allowed by CORS', HttpStatus.FORBIDDEN, {
      code: 'CORS_ORIGIN_NOT_ALLOWED',
    });
    return;
  }
  cors(corsOptions)(req, res, next);
};

export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new TooManyRequestsError();
  },
});

export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (_req, _res, _next) => {
    throw new TooManyRequestsError('Too many authentication attempts, please try again later');
  },
});
