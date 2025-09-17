// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJobService } from './cron-job.service';
import { User } from '../../users/entities/user.entity';
import { Contract } from '../../contracts/entities/contracts.entity';
import { EmailModule } from '../mailer/email.module';
import { SettingsModule } from '../../settings/settings.module';
import { NotificationModule } from '../../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, User]),
    EmailModule,
    SettingsModule,
    NotificationModule
  ],
  providers: [CronJobService],
})
export class CronJobModule {}