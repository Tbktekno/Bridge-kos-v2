import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: isProduction
      ? process.env.DATABASE_URL_PROD
      : (process.env.DATABASE_URL ?? 'file:./dev.db'),
  },
});
