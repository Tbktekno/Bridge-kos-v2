import { prisma } from '../src/utils/prisma.js';

/**
 * Deletes all rows in dependency order (children before parents) to avoid
 * foreign-key violations across test files sharing the same test database.
 */
export async function cleanDatabase(): Promise<void> {
  await prisma.reviewReply.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.boardingImage.deleteMany();
  await prisma.room.deleteMany();
  await prisma.boardingHouse.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.ownerVerification.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.session.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
}
