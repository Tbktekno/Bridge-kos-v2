import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env, isProduction } from '../config/index.js';

function resolveSqliteUrl(url: string): string {
  if (url === ':memory:') return url;
  const filePath = url.replace(/^file:/, '');
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(process.cwd(), filePath);
}

function createPrismaClient(): PrismaClient {
  if (isProduction) {
    const connectionString = env.DATABASE_URL_PROD ?? env.DATABASE_URL;
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaBetterSqlite3({ url: resolveSqliteUrl(env.DATABASE_URL) });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

export { prisma };

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
