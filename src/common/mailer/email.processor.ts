import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from './email.service';
import { Logger } from '@nestjs/common';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  constructor(private readonly emailService: EmailService) {}

  @Process('sendEmail')
  async handleSendEmail(job: Job) {
    const { to, subject, template, context } = job.data;
    this.logger.log('Processor is processing notification from the queue')
    await this.emailService.sendEmailNow({ to, subject, template, context });
  }
}
