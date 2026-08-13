import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.js';
import { logger } from '../src/utils/logger.js';

async function main(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@bridgekos.id';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const adminName = process.env.ADMIN_NAME ?? 'BridgeKos Admin';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    logger.info(`Admin already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      fullName: adminName,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });
  logger.info(`Admin created: ${adminEmail} (${adminPassword})`);
}

main()
  .catch((err) => {
    logger.error({ err }, 'Seed failed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
