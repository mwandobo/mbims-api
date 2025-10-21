import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NotificationChannelsEnum } from '../enums/notification-channels.enum';
import { CreateNotificationDto } from './create-notification.dto';

export class SendNotificationDto {
  @IsEnum(NotificationChannelsEnum)
  channel: NotificationChannelsEnum;

  @IsOptional()
  @IsUUID()
  userId?: string;
  notificationPayload: CreateNotificationDto;
}
