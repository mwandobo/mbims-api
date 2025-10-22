// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

interface EmailOptions {
  to: string | string[]; // can be single or multiple
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
    @InjectQueue('email') private readonly emailQueue: Queue, // inject Bull queue
  ) {}

  // async sendEmail(options: {
  //   to: string;
  //   subject: string;
  //   template: string;
  //   context?: Record<string, any>;
  // }): Promise<void> {
  //   await this.mailerService.sendMail({
  //     to: options.to,
  //     subject: options.subject,
  //     template: options.template, // refers to views/{template}.hbs
  //     context: options.context,
  //   });
  // }

  async sendEmail(options: EmailOptions): Promise<string> {
    await this.enqueueEmail({
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: options.context
    });

    this.logger.log('Email is Added in the Queue')
    return 'Queue addedd successfull';
  }

  async sendEmailNow(options: EmailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
    });
      this.logger.log(`Email sent to ${options.to}`);

    } catch (e) {
      this.logger.error('Send failed:', e.message);
    }

  }

  async enqueueEmail(options: EmailOptions): Promise<void> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    for (const to of recipients) {
      await this.emailQueue.add('sendEmail', {
        to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });
    }

    this.logger.log(`Queued ${recipients.length} email(s) for sending.`);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Our Service',
      template: 'welcome',
      context: { name },
    });
  }
}
