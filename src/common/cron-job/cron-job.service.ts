import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EmailService } from '../mailer/email.service';
import { Contract } from '../../contracts/entities/contracts.entity';
import { SettingsService } from '../../settings/settings.service';
import { NotificationService } from '../../notification/notification.service';
import { CreateNotificationDto } from '../../notification/dtos/create-notification.dto';
import * as process from 'node:process';

@Injectable()
export class CronJobService {
  private job: CronJob;
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly settingsService: SettingsService,
    private readonly notificationService: NotificationService,
  ) {}

  private lastCronTime: string;

  async onModuleInit() {
    const cronTime =
      (await this.settingsService.get('cron_schedule')) || '0 0 * * *';
    this.scheduleJob(cronTime);
    this.lastCronTime = cronTime;

    setInterval(() => this.checkCronScheduleUpdates(), 60 * 1000);
  }

  private async checkCronScheduleUpdates() {
    const currentCronTime = await this.settingsService.get('cron_schedule');
    if (currentCronTime && currentCronTime !== this.lastCronTime) {
      this.logger.log(
        `Cron schedule updated to "${currentCronTime}", rescheduling...`,
      );
      this.scheduleJob(currentCronTime);
      this.lastCronTime = currentCronTime;
    }
  }

  private scheduleJob(cronTime: string) {
    if (this.job) {
      this.logger.log('Stopping existing cron job');
      this.job.stop();
    }

    this.job = new CronJob(cronTime, async () => {
      this.logger.log(`Cron job triggered at ${new Date().toISOString()}`);
      try {
        await this.handleContractExpirations();
      } catch (error) {
        this.logger.error('Error during contract expiration handling', error);
      }
    });

    this.job.start();
    this.logger.log(`Notification cron job scheduled: "${cronTime}"`);
  }

  async handleContractExpirations() {
    const today = new Date().toISOString().split('T')[0];

    this.logger.log(`Checking for contracts expiring on ${today}`);

    const expiringContracts = await this.contractRepository
      .createQueryBuilder('contract')
      // .where('contract.endDate = :today', { today })
      .leftJoinAndSelect('contract.department', 'department')
      .getMany();

    if (expiringContracts.length === 0) {
      this.logger.log('No contracts expiring today.');
      return;
    }

    this.logger.log(
      `Found ${expiringContracts.length} contract(s) expiring today.`,
    );

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.canReceiveEmail = 1')
      .getMany();

    this.logger.log(`Sending notifications to ${users.length} user(s).`);

    await Promise.all(
      expiringContracts.map((contract) =>
        this.sendContractNotifications(contract, users),
      ),
    );
  }

  private async sendContractNotifications(contract: Contract, users: User[]) {
    for (const user of users) {
      this.logger.log(
        `Sending notification for contract "${contract.title}" to ${user.email}`,
      );

      // await this.emailService.sendEmail({
      //   to: user.email,
      //   subject: `Contract Expiration: ${contract.title}`,
      //   template: 'contract-expiration',
      //   context: {
      //     contractTitle: contract.title,
      //     endDate: contract.endDate,
      //     department: contract.department?.name,
      //     userName: `${user.name}`,
      //   },
      // });

      const baseUrl = process.env.FRONTEND_URL ?? 'http://legal.spp.co.tz';

      const notificationPayload: CreateNotificationDto = {
        title: 'Contract Expiration',
        description: `Contract ${contract.title} is Expiring Today, Please take necessary Actions`,
        forId: contract.id,
        forName: contract.title,
        userId: user.id,
        redirectUrl: `${baseUrl}/contracts/${contract.id}`
      }

      this.notificationService.create(notificationPayload);


    }
  }
}
