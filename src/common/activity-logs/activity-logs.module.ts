// src/activity/activity.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityService } from './activity-logs.service';
import { ActivityController } from './activity-logs.controller';
import { ActivityLog } from './activity.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityLogsModule {}
