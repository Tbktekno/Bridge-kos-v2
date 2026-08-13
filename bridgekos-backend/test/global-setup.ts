import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function globalSetup(): void {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  // Create a fresh SQLite schema for tests from prisma/schema.prisma.
  // Target is an isolated, throwaway local file (test.db) - not production.
  execSync('pnpm prisma db push --force-reset --accept-data-loss --url "file:./test.db"', {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./test.db',
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'test.db',
    },
    stdio: 'inherit',
  });
}
