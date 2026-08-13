import { fileURLToPath } from 'node:url';
import { pino } from 'pino';
import type { HttpLogger } from 'pino-http';
import { pinoHttp } from 'pino-http';
import { env, isProduction } from '../config/index.js';

const apiLogTransport = fileURLToPath(new URL('./api-log-transport.js', import.meta.url));

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordConfirmation',
      'req.body.newPassword',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  base: {
    service: 'bridgekos-backend',
    env: env.NODE_ENV,
  },
  transport: isProduction
    ? undefined
    : {
        target: apiLogTransport,
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname,req,res,responseTime,service,env',
        },
      },
});

function isApiRequest(reqUrl: string): boolean {
  return reqUrl === '/health' || reqUrl.startsWith('/health?') || reqUrl.startsWith(env.API_PREFIX);
}

export const httpLogger: HttpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => !isApiRequest(req.url ?? ''),
  },
  customLogLevel: (_req, res, err) => {
    if (err) return 'error';
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

export const requestLogger = logger.child({ scope: 'request' });
export const dbLogger = logger.child({ scope: 'database' });
