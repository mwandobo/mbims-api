// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(options: {
    to: string;
    subject: string;
    template: string;
    context?: Record<string, any>;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to: options.to,
      subject: options.subject,
      template: options.template, // refers to views/{template}.hbs
      context: options.context,
    });
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