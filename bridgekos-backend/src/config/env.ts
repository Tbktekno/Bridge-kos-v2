import { z } from 'zod';
import { config as loadDotenv } from 'dotenv';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  APP_NAME: z.string().default('BridgeKos'),

  DATABASE_URL: z.string().optional().default('file:./dev.db'),
  DATABASE_URL_PROD: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(16).default('change-me-access-secret'),
  JWT_REFRESH_SECRET: z.string().min(16).default('change-me-refresh-secret'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  PASSWORD_HASH_MEMORY: z.coerce.number().int().positive().default(65536),
  PASSWORD_HASH_TIME: z.coerce.number().int().positive().default(3),
  PASSWORD_HASH_PARALLELISM: z.coerce.number().int().positive().default(1),

  UPLOAD_DIR: z.string().default('./storage'),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().int().positive().default(5),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(true),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${messages}`);
}

export const env: Env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
