import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
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
import { NotificationChannelsEnum } from '../../notification/enums/notification-channels.enum';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class ApprovalActionService extends BaseService<ApprovalAction> {
  private readonly logger = new Logger(ApprovalLevelService.name);
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
      { fields: ['entityId'] },
      { approvalLevel: approvalLevel },
    );

    return {
      ...response,
      data: response.data.map((user) => {
        const dto = ApprovalActionResponseDto.fromEntity(user);
        return dto;
      }),
    };
  }

  async create(
    dto: CreateApprovalActionDto,
    currentUser: any,
  ): Promise<ApprovalAction> {
    const approvalLevel = await this.approvalLevelRepository.findOne({
      where: { id: dto.approvalLevelId },
    });
    if (!approvalLevel) throw new NotFoundException('Approval Level not found');

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

    if (!dto.entityCreatorId) {
      this.logger.error('entityCreatorId is missing in DTO');
      throw new BadRequestException('Missing entityCreatorId');
    }

    const entityCreator = await this.userRepository.findOne({
      where: { id: dto.entityCreatorId },
    });

    if (!entityCreator)
      throw new NotFoundException('User who created the request not found');

    const action = this.approvalActionRepository.create({
      approvalLevel: { id: approvalLevel.id },
      user: { id: user.id },
      name: dto.name,
      description: dto.description,
      action: dto.action as ApprovalActionEnum,
      entityName: dto.entityName,
      entityId: dto.entityId,
      entityCreatorId: dto.entityCreatorId,
    });

    const createdAction = await this.approvalActionRepository.save(action);

    // ⏩ Delegate notifications
    await this.handleApprovalNotifications(
      dto,
      approvalLevel,
      entityCreator,
      user,
    );

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

  private async handleApprovalNotifications(
    dto: CreateApprovalActionDto,
    approvalLevel: ApprovalLevel,
    entityCreator: User,
    user: User,
  ): Promise<void> {
    // 🟥 CASE: Request Rejected
    if (dto.action === ApprovalActionEnum.REJECTED) {
      // 1️⃣ Find all previous levels for this approval
      const previousLevels = await this.approvalLevelRepository.find({
        where: {
          userApproval: { id: approvalLevel.userApproval.id },
          level: LessThanOrEqual(approvalLevel.level),
        },
        relations: ['role'],
        order: { level: 'ASC' },
      });

      // 2️⃣ Extract all role IDs from previous levels
      const previousRoleIds = previousLevels
        .filter((lvl) => lvl.role)
        .map((lvl) => lvl.role.id);

      // 3️⃣ Fetch all users who have those roles
      const previousApprovers = await this.userRepository.find({
        where: { role: { id: In(previousRoleIds) } },
      });

      const recipients = [
        entityCreator.email, // creator
        ...previousApprovers.map((u) => u.email),
      ].filter(Boolean);

      // 4️⃣ Prepare the email context
      const context = {
        userName: entityCreator?.name || 'User',
        requestId: dto?.entityId || 'N/A',
        requestDescription: dto?.description || 'No description provided',
        rejectedBy: user?.name || 'System',
        rejectionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        priority: 'Normal',
        priorityColor: 'red',
        approvalLink: `https://your-system.com/approvals/${dto?.entityId || ''}`,
        year: new Date().getFullYear(),
      };

      // 5️⃣ Send notifications
      try {
        await this.notificationService.sendNotification({
          channel: NotificationChannelsEnum.EMAIL,
          recipients,
          context,
          template: 'approval-rejected',
          subject: `Request Rejected: ${dto.entityName}`,
        });

        this.logger.log(
          `❌ Rejection email sent to creator (${entityCreator.email}) and previous approvers: [${recipients.join(', ')}]`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Failed to send rejection notifications: ${error.message}`,
        );
      }

      return;
    }

    // 🟦 CASE: Proceed with normal next-level or final approval
    this.logger.log(
      `Checking for next approval level after level ${approvalLevel.id} (${approvalLevel.name})...`,
    );

    const nextLevel = await this.approvalLevelRepository.findOne({
      where: {
        userApproval: { id: approvalLevel.userApproval.id },
        level: MoreThan(approvalLevel.level),
      },
      order: { level: 'ASC' },
      relations: ['role'],
    });

    if (!nextLevel) {
      // ✅ Send final approval email to the creator
      const context = {
        userName: entityCreator?.name || 'User',
        requestId: dto?.entityId || 'N/A',
        requestDescription: dto?.description || 'No description provided',
        finalLevelName: approvalLevel?.name || 'Final Approval',
        approvedBy: user?.name || 'System',
        approvalDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        priority: 'Normal',
        priorityColor: 'blue',
        approvalLink: `https://your-system.com/approvals/${dto?.entityId || ''}`,
        year: new Date().getFullYear(),
      };

      try {
        await this.notificationService.sendNotification({
          channel: NotificationChannelsEnum.EMAIL,
          recipients: entityCreator.email,
          context,
          template: 'request-approved',
          subject: `Approval Complete For Entity: ${dto.entityName}`,
        });

        this.logger.log(
          `✅ Sent final approval notification to ${entityCreator.email}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Failed to send final approval email: ${error.message}`,
        );
      }

      return;
    }

    // 📨 If there’s a next level, send next-level notification
    this.logger.log(
      `Next level found: ${nextLevel.name} (Role: ${nextLevel.role?.name || 'N/A'})`,
    );

    const role = nextLevel.role;

    const context = {
      userName: user?.name || 'Approver',
      requestId: dto?.entityId || 'N/A',
      requestDescription: dto?.description || 'No description provided',
      currentLevelName: approvalLevel?.name || 'Current Level',
      nextLevelName: nextLevel?.name || 'Final Level',
      submittedBy: user?.email || 'system@yourdomain.com',
      submissionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      priority: 'Normal',
      priorityColor: 'blue',
      dueDate: 'Not specified',
      year: new Date().getFullYear(),
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
      return;
    }

    try {
      await this.notificationService.sendNotification({
        channel: NotificationChannelsEnum.EMAIL,
        recipients,
        context,
        template: 'next-approval',
        subject: `Approval Required: ${dto.entityName}`,
      });

      this.logger.log(
        `✅ Successfully sent next-level notification to: [${recipients.join(', ')}]`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send next-level notification: ${error.message}`,
      );
    }
  }
}
