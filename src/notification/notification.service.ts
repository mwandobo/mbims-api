// notifications/notification.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

import { CreateNotificationDto } from './dtos/create-notification.dto';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { NotificationResponseDto } from './dtos/notification-response.dto';

import {
  PaginationDto,
  PaginatedResponseDto,
} from '../common/dtos/pagination.dto';
import { BaseService } from '../common/services/base-service';

@Injectable()
export class NotificationService extends BaseService<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(notificationRepository);
  }

  async findAll(
    pagination: PaginationDto,
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

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const { userId, notifiedPersonnelId, ...rest } = dto;

    const [user, notifiedPersonnel] = await Promise.all([
      this.findUser(userId),
      notifiedPersonnelId ? this.findUser(notifiedPersonnelId) : null,
    ]);

    const notification = this.notificationRepository.create({
      ...rest,
      user,
      notifiedPersonnel,
    });

    const saved = await this.notificationRepository.save(notification);

    return NotificationResponseDto.fromNotification(saved);
  }

  async update(
    id: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.findById(id, ['user', 'notifiedPersonnel']);

    const { userId, notifiedPersonnelId, ...rest } = dto;

    if (userId) {
      notification.user = await this.findUser(userId);
    }

    if (notifiedPersonnelId !== undefined) {
      notification.notifiedPersonnel = notifiedPersonnelId
        ? await this.findUser(notifiedPersonnelId)
        : null;
    }

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

  private async findUser(userId: string): Promise<User> {
    console.log('passed user', userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }
}
