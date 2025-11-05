import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';

import { ApprovalLevel } from '../entities/approval-level.entity';
import { UserApproval } from '../entities/user-approval.entity';

import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dtos/pagination.dto';
import { BaseService } from '../../../common/services/base-service';
import { Role } from '../../../admnistration/roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { CreateApprovalLevelDto } from '../dto/create-approval-level.dto';
import { UpdateApprovalLevelDto } from '../dto/update-approval-level.dto';
import { LoggedInUserDto } from '../../../common/dtos/logged-in-user.dto';
import { plainToInstance } from 'class-transformer';
import { ApprovalAction } from '../entities/approval-action.entity';
import { ApprovalActionCreationTypeEnum } from '../enums/approval-action-creation-type.enum';
import { ApprovalActionEnum } from '../enums/approval-action.enum';
import { SendNotificationDto } from '../../notification/dtos/send-notification.dto';
import { NotificationService } from '../../notification/notification.service';
import { NotificationChannelsEnum } from '../../notification/enums/notification-channels.enum';
import { ApprovalLevelResponseDto } from '../dto/approval-level-response.dto';
import { ApprovalActionResponseDto } from '../dto/approval-action-response.dto';
import { SysApproval } from '../entities/system-approval.entity';

@Injectable()
export class ApprovalLevelService extends BaseService<ApprovalLevel> {
  private readonly logger = new Logger(ApprovalLevelService.name);

  constructor(
    @InjectRepository(ApprovalLevel)
    private readonly approvalLevelRepository: Repository<ApprovalLevel>,

    @InjectRepository(SysApproval)
    private readonly sysApprovalRepository: Repository<SysApproval>,

    @InjectRepository(UserApproval)
    private readonly userApprovalRepository: Repository<UserApproval>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ApprovalAction)
    private readonly approvalActionRepository: Repository<ApprovalAction>,

    private readonly notificationService: NotificationService,
  ) {
    super(approvalLevelRepository);
  }

  /**
   * Get all approval levels with pagination
   */
  async findAll(
    pagination: PaginationDto,
    userApprovalId: string,
  ): Promise<PaginatedResponseDto<ApprovalLevelResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['userApproval', 'role', 'user'], // relations
      {
        fields: ['name', 'description', 'level'],
        relations: {
          userApproval: ['name'],
          role: ['name'],
          user: ['email'],
        },
      },
      { userApproval: userApprovalId },
    );

    // return {
    //   ...response,
    //   data: response.data.map((level) => ({
    //     ...level,
    //     userApprovalName: level.userApproval?.name ?? null,
    //     roleName: level.role?.name ?? null,
    //     userEmail: level.user?.email ?? null,
    //   })),
    // };

    return {
      ...response,
      data: response.data.map((user) => {
        const dto = ApprovalLevelResponseDto.fromEntity(user);
        return dto;
      }),
    };
  }

  async createApprovalLevel(
    dto: CreateApprovalLevelDto,
    userApprovalId: string,
    user: LoggedInUserDto,
  ): Promise<ApprovalLevel> {
    this.logger.log(
      `Creating approval level for user ${user.userId} with name: ${dto.name}`,
    );

    const role = await this.validateRole(dto.roleId);
    const existingApprovalLevel = await this.approvalLevelRepository.findOne({
      where: {
        role: { id: dto.roleId },
        userApproval: { id: userApprovalId },
      },
    });

    if (existingApprovalLevel) {
      this.logger.log(`Level Exists role with id: ${dto.roleId}`);
      throw new BadRequestException(
        `ApprovalLevel with Role ${role.name} exists`,
      );
    }

    const approvalLevel = this.approvalLevelRepository.create({
      name: dto.name,
      description: dto.description,
      level: await this.updateApprovalLevelOrder(userApprovalId, 'CREATE'),
      user: { id: user.userId },
      role: { id: dto.roleId },
    });

    // ✅ Validate relations
    this.logger.log(`Validating userApproval with id: ${userApprovalId}`);
    const userApproval = await this.validateUserApproval(userApprovalId);
    approvalLevel.userApproval = userApproval;

    // ✅ Save the new approval level first
    const saved = await this.approvalLevelRepository.save(approvalLevel);
    this.logger.log(`Saved new approval level with id: ${saved.id}`);

    const previousLevel = await this.approvalLevelRepository.findOne({
      where: {
        userApproval: { id: userApproval.id },
        createdAt: LessThan(saved.createdAt),
        id: Not(saved.id),
      },
      order: { createdAt: 'DESC' },
    });

    if (previousLevel) {
      this.logger.log(
        `Found previous level with id: ${previousLevel.id}, duplicating actions...`,
      );

      // ✅ Step 2: Get all actions from previous level
      const previousActions = await this.approvalActionRepository.find({
        where: { approvalLevel: { id: previousLevel.id } },
      });

      this.logger.log(`Found ${previousActions.length} previous actions`);

      const allApproved = previousActions.every(
        (act) => act.action === ApprovalActionEnum.APPROVED,
      );

      if (allApproved) {
        this.logger.log(
          `All previous actions are APPROVED — creating automatic actions for new level.`,
        );

        this.logger.log(
          `All previous actions are APPROVED — creating automatic actions for new level.`,
        );

        const newActions = previousActions.map((act) =>
          this.approvalActionRepository.create({
            approvalLevel: { id: saved.id },
            user: { id: user.userId },
            name: act.name,
            description: act.description,
            action: act.action,
            entityName: act.entityName,
            entityId: act.entityId,
            type: ApprovalActionCreationTypeEnum.AUTOMATIC,
            entityCreatorId: previousActions[0]?.entityCreatorId,
          }),
        );

        await this.approvalActionRepository.save(newActions);
        this.logger.log(
          `Saved ${newActions.length} automatic actions for new level id: ${saved.id}`,
        );
      } else {
        this.logger.log(
          `Previous actions are not all APPROVED — skipping automatic action creation.`,
        );
      }
    } else {
      this.logger.log('No previous approval level found');
    }

    // ✅ Send notifications
    this.logger.log('Sending notifications for new approval level');
    await this.sendCreateLevelNotification(saved, role);

    this.logger.log(`Approval level creation completed: id=${saved.id}`);
    return saved;
  }

  async findOne(id: string): Promise<ApprovalLevelResponseDto> {
    const request = await this.approvalLevelRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }
    return plainToInstance(ApprovalLevelResponseDto, request);
  }

  /**
   * Update an approval level
   */
  async updateApprovalLevel(
    id: string,
    dto: UpdateApprovalLevelDto,
  ): Promise<ApprovalLevel> {
    const level = await this.approvalLevelRepository.findOne({
      where: { id },
      relations: ['userApproval', 'role', 'user'],
    });

    if (!level) {
      throw new NotFoundException(`ApprovalLevel with ID ${id} not found`);
    }

    Object.assign(level, {
      name: dto.name,
      description: dto.description,
      status: dto.status ?? level.status,
    });

    if (dto.userApprovalId) {
      level.userApproval = await this.validateUserApproval(dto.userApprovalId);
    }

    if (dto.roleId) {
      level.role = await this.validateRole(dto.roleId);
      level.user = null; // clear user if role is set
    }

    if (dto.userId) {
      level.user = await this.validateUser(dto.userId);
      level.role = null; // clear role if user is set
    }

    return this.approvalLevelRepository.save(level);
  }

  /**
   * Delete (soft or hard)
   */
  // async deleteApprovalLevel(id: string, soft = true): Promise<void> {
  //   const level = await this.approvalLevelRepository.findOne({ where: { id } });
  //   if (!level) {
  //     throw new NotFoundException(`ApprovalLevel with ID ${id} not found`);
  //   }
  //   await this.approvalLevelRepository.remove(level);
  // }

  async deleteApprovalLevel(id: string, soft = true): Promise<void> {
    const level = await this.approvalLevelRepository.findOne({
      where: { id },
      relations: ['userApproval'], // we need the relation for reordering
    });

    if (!level) {
      throw new NotFoundException(`ApprovalLevel with ID ${id} not found`);
    }

    await this.approvalLevelRepository.remove(level);

    // Reorder remaining levels
    await this.updateApprovalLevelOrder(level.userApproval.id, 'DELETE', level);
  }

  /**
   * Adjust approval level numbering intelligently.
   * - When creating: assigns next available level number.
   * - When deleting: shifts higher levels down by one.
   */
  private async updateApprovalLevelOrder(
    userApprovalId: string,
    action: 'CREATE' | 'DELETE',
    affectedLevel?: ApprovalLevel,
  ): Promise<number> {
    const levels = await this.approvalLevelRepository.find({
      where: { userApproval: { id: userApprovalId } },
      order: { level: 'ASC' },
    });

    if (action === 'CREATE') {
      // Just return next level number
      return levels.length > 0 ? levels[levels.length - 1].level + 1 : 1;
    }

    if (action === 'DELETE' && affectedLevel) {
      const deletedLevelNum = affectedLevel.level;

      // Shift all levels greater than deleted down by one
      for (const lvl of levels) {
        if (lvl.level > deletedLevelNum) {
          lvl.level -= 1;
          await this.approvalLevelRepository.save(lvl);
        }
      }

      return deletedLevelNum;
    }

    return 1;
  }

  /**
   * Notification logic
   */
  private async sendCreateLevelNotification(
    level: ApprovalLevel,
    role?: Role,
  ): Promise<void> {
    this.logger.log(`Approval level passed level=${JSON.stringify(level)}`);

    const context = {
      levelName: level.name,
      description: level.description,
      status: level.status,
      year: new Date().getFullYear(),
    };

    let recipients: string[] = [];

    if (role) {
      const users = await this.userRepository.find({
        where: { role: { id: role.id } },
      });
      recipients = users.map((u) => u.email);
    }

    if (!recipients.length) return;

    const dto: SendNotificationDto = {
      channel: NotificationChannelsEnum.EMAIL,
      recipients,
      forName: level.userApproval?.sysApproval?.entityName,
      forId: level.id,
      context: context,
      template: 'create-level',
      subject: 'New Level Created',
      description: `New Level created name ${level.name} for Approval ${level.userApproval?.name}`,
      redirectUrl: ''
    };

    await this.notificationService.sendNotification(dto);
  }

  private async validateUserApproval(id: string): Promise<UserApproval> {
    const ua = await this.userApprovalRepository.findOne({ where: { id } });
    if (!ua)
      throw new NotFoundException(`UserApproval with ID ${id} not found`);
    return ua;
  }

  private async validateRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  private async validateUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
}
