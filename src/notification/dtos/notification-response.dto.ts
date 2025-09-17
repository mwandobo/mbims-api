// notifications/dto/notification-response.dto.ts
import { Expose } from 'class-transformer';
import { Notification } from '../entities/notification.entity';

export class NotificationResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  forName: string;

  @Expose()
  forId: string;

  @Expose()
  isRead: boolean;

  @Expose()
  expiresAt: string;

  @Expose()
  userId: string;

  @Expose()
  notifiedPersonnelId: string;

  @Expose()
  redirectUrl: string;

  @Expose()
  group: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  userName: string;

  @Expose()
  notifiedPersonnelName: string;

  static fromNotification(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = notification.id;
    dto.title = notification.title;
    dto.description = notification.description;
    dto.forName = notification.forName;
    dto.forId = notification.forId;
    dto.isRead = notification.isRead;
    dto.expiresAt = notification.expiresAt;
    dto.redirectUrl = notification.redirectUrl;
    dto.group = notification.group;
    dto.createdAt = notification.createdAt.toISOString();
    dto.updatedAt = notification.updatedAt.toISOString();

    dto.userId = (notification.user as any)?.id || '';
    dto.userName = notification.user?.name || ''; // assumes `name` exists in User entity

    dto.notifiedPersonnelId = (notification.notifiedPersonnel as any)?.id || '';
    dto.notifiedPersonnelName = notification.notifiedPersonnel?.name || '';

    return dto;
  }
}
