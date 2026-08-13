import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function globalTeardown(): void {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  for (const file of ['test.db', 'test.db-journal', 'test.db-wal', 'test.db-shm']) {
    rmSync(path.join(root, file), { force: true });
  }
}
