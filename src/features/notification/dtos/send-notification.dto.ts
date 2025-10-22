import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { NotificationChannelsEnum } from '../enums/notification-channels.enum';

export class SendNotificationDto {
  @IsEnum(NotificationChannelsEnum)
  channel: NotificationChannelsEnum;

  @IsString()
  template?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  subject?: string;

  @IsString()
  description?: string;

  @IsString()
  forName?: string;

  @IsString()
  forId?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsString()
  expiresAt?: string;

  @IsOptional()
  @IsUUID()
  recipients?: string | string [];

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  group?: string;

  context?: any;
}
