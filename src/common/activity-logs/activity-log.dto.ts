import { ActivityLog } from './activity.entity';

export class ActivityLogDto {
  id: string;
  user: string;
  method: string;
  endpoint: string;
  activity: string;
  data: string;
  ip: string;
  duration: number;
  createdAt: Date;


  static fromActivityLog(log: ActivityLog): ActivityLogDto {
    const dto = new ActivityLogDto();
    dto.id = log.id;
    dto.user = log.user;
    dto.activity = log.activity;
    dto.method = log.method;
    dto.createdAt = log.createdAt;

    return dto;
  }
}




