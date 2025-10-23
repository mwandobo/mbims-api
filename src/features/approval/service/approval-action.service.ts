import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { ApprovalAction } from '../entities/approval-action.entity';
import { ApprovalLevel } from '../entities/approval-level.entity';
import { User } from '../../users/entities/user.entity';
import { BaseService } from '../../../common/services/base-service';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dtos/pagination.dto';
import { CreateApprovalActionDto } from '../dto/create-approval-action.dto';
import { UpdateApprovalActionDto } from '../dto/update-approval-action.dto';
import { ApprovalActionEnum } from '../enums/approval-action.enum';
import { ApprovalActionResponseDto } from '../dto/approval-action-response.dto';
import { ApprovalLevelService } from './approval-level.service';
import { SendNotificationDto } from '../../notification/dtos/send-notification.dto';
import { NotificationChannelsEnum } from '../../notification/enums/notification-channels.enum';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class ApprovalActionService extends BaseService<ApprovalAction> {
  private readonly logger = new Logger(ApprovalLevelService.name)
  constructor(
    @InjectRepository(ApprovalAction)
    private readonly approvalActionRepository: Repository<ApprovalAction>,

    @InjectRepository(ApprovalLevel)
    private readonly approvalLevelRepository: Repository<ApprovalLevel>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificationService: NotificationService,
  ) {
    super(approvalActionRepository);
  }

  /**
   * Get all approval actions with optional search
   */

  // Find all requests with pagination
  async findAll(
    pagination: PaginationDto,
    approvalLevel?: string,
  ): Promise<PaginatedResponseDto<ApprovalActionResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['user', 'approvalLevel'], // load request items and their assets
      { fields: ['entityId'],
      },
      { approvalLevel: approvalLevel }
    );

    return {
      ...response,
      data: response.data.map((user) => {
        const dto = ApprovalActionResponseDto.fromEntity(user);
        return dto;
      }),
    };
  }




  /**
   * Create a new approval action
   */
  // async create(
  //   dto: CreateApprovalActionDto,
  //   currentUser: any,
  // ): Promise<ApprovalAction> {
  //
  //   const approvalLevel = await this.approvalLevelRepository.findOne({
  //     where: { id: dto.approvalLevelId },
  //   });
  //   if (!approvalLevel) throw new NotFoundException('Approval Level not found');
  //
  //   // Check duplicate
  //   const existing = await this.approvalActionRepository.findOne({
  //     where: {
  //       approvalLevel: { id: dto.approvalLevelId },
  //       entityId: dto.entityId
  //     },
  //   });
  //   if (existing)
  //     throw new BadRequestException(
  //       'Approval Action has been done for this level and entity',
  //     );
  //
  //   const user = await this.userRepository.findOne({
  //     where: { id: currentUser.userId },
  //   });
  //
  //   if (!user) throw new NotFoundException('User not found');
  //
  //   const action = this.approvalActionRepository.create({
  //     approvalLevel: { id: approvalLevel.id }, // only the ID
  //     user: { id: user.id },
  //     name: dto.name,
  //     description: dto.description,
  //     action: dto.action as ApprovalActionEnum, // ✅ cast string to enum
  //     entityName: dto.entityName,
  //     entityId: dto.entityId,
  //   });
  //
  //   return this.approvalActionRepository.save(action);
  // }



  async create(
    dto: CreateApprovalActionDto,
    currentUser: any,
  ): Promise<ApprovalAction> {
    const approvalLevel = await this.approvalLevelRepository.findOne({
      where: { id: dto.approvalLevelId },
    });
    if (!approvalLevel) throw new NotFoundException('Approval Level not found');

    // Check duplicate
    const existing = await this.approvalActionRepository.findOne({
      where: {
        approvalLevel: { id: dto.approvalLevelId },
        entityId: dto.entityId,
      },
    });
    if (existing)
      throw new BadRequestException(
        'Approval Action has been done for this level and entity',
      );

    const user = await this.userRepository.findOne({
      where: { id: currentUser.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const action = this.approvalActionRepository.create({
      approvalLevel: { id: approvalLevel.id },
      user: { id: user.id },
      name: dto.name,
      description: dto.description,
      action: dto.action as ApprovalActionEnum,
      entityName: dto.entityName,
      entityId: dto.entityId,
    });

    const createdAction = await this.approvalActionRepository.save(action);

    // =====================================================
    // 🔹 Sending notifications to next level approvers
    // =====================================================

    this.logger.log(
      `Checking for next approval level after level ${approvalLevel.id} (${approvalLevel.name})...`,
    );

    const nextLevel = await this.approvalLevelRepository.findOne({
      where: {
        userApproval: { id: approvalLevel.userApproval.id },
        level: MoreThan(approvalLevel.level),
      },
      order: { createdAt: 'ASC' },
      relations: ['role'],
    });

    if (!nextLevel) {
      this.logger.log('No next approval level found. Notification skipped.');
      return createdAction;
    }

    this.logger.log(
      `Next level found: ${nextLevel.name} (Role: ${nextLevel.role?.name || 'N/A'})`,
    );

    const role = nextLevel.role;

    // Mock email template data (this can be customized per entity)
    // const context = {
    //   userName: user.name,
    //   requestId: dto.entityId,
    //   requestDescription: dto.description,
    //   currentLevelName: approvalLevel.name,
    //   nextLevelName: nextLevel.name,
    //   submittedBy: user.email,
    //   submissionDate: new Date().toLocaleDateString(),
    //   priority: 'Normal',
    //   year: new Date().getFullYear(),
    //   priorityColor: 'blue',
    //   approvalLink: `https://your-system.com/approvals/${dto.entityId}`,
    // };

    const context = {
      // 👤 Recipient details
      userName: user?.name || 'Approver',

      // 🧾 Request details
      requestId: dto?.entityId || 'N/A',
      requestDescription: dto?.description || 'No description provided',

      // 🔁 Level details
      currentLevelName: approvalLevel?.name || 'Current Level',
      nextLevelName: nextLevel?.name || 'Final Level',

      // 📤 Submission info
      submittedBy: user?.email || 'system@yourdomain.com',
      submissionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),

      // ⚙️ Priority setup
      priority:  'Normal',
      priorityColor: 'blue',
      dueDate :'Not specified',
      year: new Date().getFullYear(),

      // 🔗 Action link
      approvalLink: `https://your-system.com/approvals/${dto?.entityId || ''}`,
    };

    let recipients: string[] = [];

    if (role) {
      const users = await this.userRepository.find({
        where: { role: { id: role.id } },
      });

      recipients = users.map((u) => u.email);
      this.logger.log(
        `Users found for role "${role.name}": ${recipients.length} → [${recipients.join(', ')}]`,
      );
    }

    if (recipients.length === 0) {
      this.logger.warn(
        `No recipients found for next approval level "${nextLevel.name}".`,
      );
      return createdAction;
    }

    try {
      const notificationDto: SendNotificationDto = {
        channel: NotificationChannelsEnum.EMAIL,
        recipients,
        context,
        template: 'next-approval',
        subject: `Approval Required: ${dto.entityName}`,
      };

      this.logger.log(
        `Sending email notification for next level "${nextLevel.name}" to ${recipients.length} users...`,
      );

      await this.notificationService.sendNotification(notificationDto);

      this.logger.log(
        `✅ Successfully sent approval notification to next level approvers: [${recipients.join(', ')}]`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send notification for next level ${nextLevel.name}: ${error.message}`,
      );
    }

    return createdAction;
  }







  /**
   * Update an existing approval action
   */
  async update(
    id: string,
    dto: UpdateApprovalActionDto,
    currentUserId: string,
  ): Promise<ApprovalAction> {
    const action = await this.approvalActionRepository.findOne({
      where: { id },
    });
    if (!action) throw new NotFoundException('Approval Action not found');

    const approvalLevel = await this.approvalLevelRepository.findOne({
      where: { id: dto.approvalLevelId },
    });
    if (!approvalLevel) throw new NotFoundException('Approval Level not found');

    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(action, {
      approvalLevel,
      user,
      name: dto.name,
      description: dto.description,
      action: dto.action,
      entityName: dto.entityName,
      entityId: dto.entityId,
      status: dto.status ?? action.status,
    });

    return this.approvalActionRepository.save(action);
  }

  /**
   * Delete approval action (soft or hard)
   */
  async delete(id: string, soft = true): Promise<void> {
    const action = await this.approvalActionRepository.findOne({
      where: { id },
    });
    if (!action) throw new NotFoundException('Approval Action not found');

    await this.approvalActionRepository.remove(action);
  }
}
