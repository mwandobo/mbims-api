// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  // ✅ Queued send entrypoint
  async sendEmail(options: EmailOptions): Promise<string> {
    this.logger.debug(`[sendEmail] Request received → to=${options.to}, subject="${options.subject}", template="${options.template}"`);
    try {
      await this.enqueueEmail(options);
      this.logger.log('[sendEmail] Email added to queue successfully.');
      return 'Email successfully queued';
    } catch (e) {
      this.logger.error(`[sendEmail] Failed to enqueue email: ${e.message}`, e.stack);
      throw e;
    }
  }

  // ✅ Send email immediately (used by processor)
  async sendEmailNow(options: EmailOptions): Promise<void> {
    this.logger.debug(`[sendEmailNow] Sending email now to=${options.to}`);
    try {
      if (!options.to) throw new Error('Recipient "to" field is empty');

      // Show config info (optional)
      const transportHost = this.configService.get('MAIL_HOST');
      const fromAddress = this.configService.get('MAIL_FROM');
      this.logger.verbose(`[sendEmailNow] Using transport host: ${transportHost}`);
      this.logger.verbose(`[sendEmailNow] From address: ${fromAddress}`);

      // Try sending
      const result = await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });

      this.logger.log(`[sendEmailNow] ✅ Email sent successfully to: ${options.to}`);
      this.logger.debug(`[sendEmailNow] Mailer result: ${JSON.stringify(result, null, 2)}`);
    } catch (e) {
      this.logger.error(`[sendEmailNow] ❌ Send failed: ${e.message}`);
      this.logger.error(`[sendEmailNow] Stack trace:\n${e.stack}`);
    }
  }

  // ✅ Queue handler
  async enqueueEmail(options: EmailOptions): Promise<void> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    this.logger.debug(`[enqueueEmail] Preparing to queue ${recipients.length} recipient(s)`);

    for (const to of recipients) {
      this.logger.debug(`[enqueueEmail] Queuing → ${to}`);
      await this.emailQueue.add('sendEmail', {
        to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });
    }

    this.logger.log(`[enqueueEmail] Queued ${recipients.length} email(s) for sending.`);
  }

  // ✅ Example email
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    this.logger.debug(`[sendWelcomeEmail] Sending welcome email to: ${email}`);
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Our Service',
      template: 'welcome',
      context: { name },
    });
  }
}
