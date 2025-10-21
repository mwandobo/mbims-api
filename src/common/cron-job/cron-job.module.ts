// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJobService } from './cron-job.service';
import { User } from '../../features/users/entities/user.entity';
import { Contract } from '../../features/contracts/entities/contracts.entity';
import { EmailModule } from '../mailer/email.module';
import { SettingsModule } from '../../features/settings/settings.module';
import { NotificationModule } from '../../features/notification/notification.module';

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