import { env } from '../config/index.js';
import { logger } from './logger.js';

export interface MailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

/**
 * Mail transport abstraction. Swappable implementation so future providers
 * (SMTP/nodemailer, SES, Resend, ...) can be added without touching callers.
 * Falls back to console logging until SMTP_* credentials are configured.
 */
class ConsoleMailer implements Mailer {
  async send(message: MailMessage): Promise<void> {
    if (!process.env.SMTP_HOST) {
      logger.info(
        { to: message.to, subject: message.subject },
        'email outbound skipped (SMTP not configured)',
      );
      return;
    }
    logger.warn(
      { to: message.to, subject: message.subject },
      'email transport not implemented, logging only',
    );
  }
}

export const mailer: Mailer = new ConsoleMailer();
export const clientUrl = env.CLIENT_URL;
