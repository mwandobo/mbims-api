// notifications/notification.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

import { CreateNotificationDto } from './dtos/create-notification.dto';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { NotificationResponseDto } from './dtos/notification-response.dto';

import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { BaseService } from '../../common/services/base-service';
import { SendNotificationDto } from './dtos/send-notification.dto';
import { NotificationChannelsEnum } from './enums/notification-channels.enum';
import { EmailService } from '../../common/mailer/email.service';

@Injectable()
export class NotificationService extends BaseService<Notification> {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {
    super(notificationRepository);
  }

  async findAll(
    pagination: PaginationDto,
    user: any
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['user', 'notifiedPersonnel'], // relations to load
      {
        fields: ['title', 'description'], // searchable fields
        relations: {
          user: ['name', 'email'],
          notifiedPersonnel: ['name', 'email'],
        },
      },
      { notifiedPersonnel: user.userId },
    );

    return {
      ...response,
      data: response.data.map((n) =>
        NotificationResponseDto.fromNotification(n),
      ),
    };
  }

  async findOne(id: string): Promise<NotificationResponseDto> {
    const notification = await this.findById(id, ['user', 'notifiedPersonnel']);
    return NotificationResponseDto.fromNotification(notification);
  }

  async sendNotification(dto: SendNotificationDto): Promise<string> {
    const {
      channel,
      template,
      recipients,
      userId,
      subject,
      context,
      description,
      forName,
      forId,
      redirectUrl,
      ...rest
    } = dto;

    switch (channel) {
      case NotificationChannelsEnum.EMAIL:
        const emailPayload = {
          to: recipients,
          subject,
          template,
          context,
        };
        await this.emailService.sendEmail(emailPayload);
    }

    const _recipients = Array.isArray(recipients) ? recipients : [recipients];

    for (const recipient of _recipients) {
      this.logger.debug(`[enqueueEmail] Queuing → ${recipient}`);
      const createNotificationPayload = {
        title: subject,
        description: description,
        forName: forName,
        forId: forId,
        userId: userId,
        recipientId: recipient,
        redirectUrl: redirectUrl,
        group: '',
      };
      await this.create(createNotificationPayload);
    }

    this.logger.debug('template', template);

    return 'notification sent successfully';
  }

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const { userId, recipientId, ...rest } = dto;

    const [user, notifiedPersonnel] = await Promise.all([
      this.findUser(userId),
      recipientId ? this.findUser(recipientId, 'email') : null,
    ]);

    const notification = this.notificationRepository.create({
      ...rest,
      user,
      notifiedPersonnel: notifiedPersonnel,
    });

    const saved = await this.notificationRepository.save(notification);

    return NotificationResponseDto.fromNotification(saved);
  }

  async update(
    id: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.findById(id, ['user', 'notifiedPersonnel']);

    const { userId, ...rest } = dto;

    if (userId) {
      notification.user = await this.findUser(userId);
    }

    // if (notifiedPersonnelId !== undefined) {
    //   notification.notifiedPersonnel = notifiedPersonnelId
    //     ? await this.findUser(notifiedPersonnelId)
    //     : null;
    // }

    Object.assign(notification, rest);
    const updated = await this.notificationRepository.save(notification);

    return NotificationResponseDto.fromNotification(updated);
  }

  async findByUserId(
    userId: string,
    pagination?: PaginationDto,
    options?: {
      isRead?: boolean;
      isSoftDeleted?: string;
    },
  ): Promise<any> {
    const { isRead, isSoftDeleted } = options || {};

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .leftJoinAndSelect('notification.notifiedPersonnel', 'notifiedPersonnel')
      .where('notification.user_id = :userId', { userId });

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.is_read = :isRead', { isRead });
    }

    if (isSoftDeleted !== undefined) {
      queryBuilder.andWhere('notification.is_soft_deleted = :isSoftDeleted', {
        isSoftDeleted,
      });
    }

    if (pagination) {
      queryBuilder
        .skip(pagination.page)
        .take(pagination.limit)
        .orderBy('notification.created_at', 'DESC');
    }

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return { notifications, total };
  }

  async delete(id: string): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  private async findById(
    id: string,
    relations: string[] = [],
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations,
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async read(notificationId: string): Promise<any> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }
    notification.isRead = true;

    return await this.notificationRepository.save(notification);
  }

  private async findUser(userId: string, type?: string): Promise<User> {
    if (type === 'email') {
      const user = await this.userRepository.findOne({
        where: { email: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      return user;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }
}
