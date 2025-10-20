import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { AssetRequestResponseDto } from '../../assets-management/asset-request/dtos/asset-request-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApprovalAction } from '../entities/approval-action.entity';

@Injectable()
export class ApprovalLevelService extends BaseService<ApprovalLevel> {
  private readonly logger = new Logger(ApprovalLevelService.name);

  constructor(
    @InjectRepository(ApprovalLevel)
    private readonly approvalLevelRepository: Repository<ApprovalLevel>,

    @InjectRepository(UserApproval)
    private readonly userApprovalRepository: Repository<UserApproval>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ApprovalAction)
    private readonly approvalActionRepository: Repository<ApprovalAction>,


    // private readonly notificationService: NotificationService,
  ) {
    super(approvalLevelRepository);
  }

  /**
   * Get all approval levels with pagination
   */
  async findAll(
    pagination: PaginationDto,
    userApprovalId: string,
  ): Promise<PaginatedResponseDto<ApprovalLevel>> {
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

    return {
      ...response,
      data: response.data.map((level) => ({
        ...level,
        userApprovalName: level.userApproval?.name ?? null,
        roleName: level.role?.name ?? null,
        userEmail: level.user?.email ?? null,
      })),
    };
  }

  /**
   * Create an approval level
   */

  // async createApprovalLevel(
  //   dto: CreateApprovalLevelDto,
  //   userApprovalId: string,
  //   user: LoggedInUserDto,
  // ): Promise<ApprovalLevel> {
  //   const approvalLevel = this.approvalLevelRepository.create({
  //     name: dto.name,
  //     description: dto.description,
  //     level: dto.level,
  //     user: { id: user.userId },
  //   });
  //
  //   // Validate relations
  //   const userApproval = await this.validateUserApproval(userApprovalId);
  //   approvalLevel.userApproval = userApproval;
  //
  //   let role: Role | null = null;
  //
  //   if (dto.roleId) {
  //     role = await this.validateRole(dto.roleId);
  //     approvalLevel.role = role;
  //   }
  //
  //   const saved = await this.approvalLevelRepository.save(approvalLevel);
  //
  //   // Send notifications
  //   await this.sendCreateLevelNotification(saved, role);
  //
  //   return saved;
  // }

  // async createApprovalLevel(
  //   dto: CreateApprovalLevelDto,
  //   userApprovalId: string,
  //   user: LoggedInUserDto,
  // ): Promise<ApprovalLevel> {
  //   const approvalLevel = this.approvalLevelRepository.create({
  //     name: dto.name,
  //     description: dto.description,
  //     level: dto.level,
  //     user: { id: user.userId },
  //   });
  //
  //   // ✅ Validate relations
  //   const userApproval = await this.validateUserApproval(userApprovalId);
  //   approvalLevel.userApproval = userApproval;
  //
  //   let role: Role | null = null;
  //   if (dto.roleId) {
  //     role = await this.validateRole(dto.roleId);
  //     approvalLevel.role = role;
  //   }
  //
  //   // ✅ Save the new approval level first
  //   const saved = await this.approvalLevelRepository.save(approvalLevel);
  //
  //   // ✅ Step 1: Check if previous level exists
  //   const previousLevel = await this.approvalLevelRepository.findOne({
  //     where: { userApproval: { id: userApproval.id } },
  //     order: { createdAt: 'DESC' }, // ✅ get the latest created level
  //   });
  //
  //   if (previousLevel) {
  //     // ✅ Step 2: Get all actions from previous level
  //     const previousActions = await this.approvalActionRepository.find({
  //       where: { approvalLevel: { id: previousLevel.id } },
  //     });
  //
  //     if (previousActions.length > 0) {
  //       // ✅ Step 3: Duplicate them for the new level
  //       const newActions = previousActions.map((act) =>
  //         this.approvalActionRepository.create({
  //           approvalLevel: { id: saved.id },
  //           user: { id: user.userId }, // creator of the new level
  //           name: act.name,
  //           description: act.description,
  //           action: act.action,
  //           entityName: act.entityName,
  //           entityId: act.entityId,
  //         }),
  //       );
  //
  //       // ✅ Step 4: Save all new actions
  //       await this.approvalActionRepository.save(newActions);
  //     }
  //   }
  //
  //   // ✅ Send notifications
  //   await this.sendCreateLevelNotification(saved, role);
  //
  //   return saved;
  // }


  async createApprovalLevel(
    dto: CreateApprovalLevelDto,
    userApprovalId: string,
    user: LoggedInUserDto,
  ): Promise<ApprovalLevel> {

    this.logger.log(`Creating approval level for user ${user.userId} with name: ${dto.name}`);

    const approvalLevel = this.approvalLevelRepository.create({
      name: dto.name,
      description: dto.description,
      level: dto.level,
      user: { id: user.userId },
    });

    // ✅ Validate relations
    this.logger.log(`Validating userApproval with id: ${userApprovalId}`);
    const userApproval = await this.validateUserApproval(userApprovalId);
    approvalLevel.userApproval = userApproval;

    let role: Role | null = null;
    if (dto.roleId) {
      this.logger.log(`Validating role with id: ${dto.roleId}`);
      role = await this.validateRole(dto.roleId);
      approvalLevel.role = role;
    }

    // ✅ Save the new approval level first
    const saved = await this.approvalLevelRepository.save(approvalLevel);
    this.logger.log(`Saved new approval level with id: ${saved.id}`);

    // ✅ Step 1: Check if previous level exists
    // const previousLevel = await this.approvalLevelRepository.findOne({
    //   where: { userApproval: { id: userApproval.id } },
    //   order: { createdAt: 'DESC' },
    // });

    const previousLevel = await this.approvalLevelRepository.findOne({
      where: {
        userApproval: { id: userApproval.id },
        createdAt: LessThan(saved.createdAt),
        id: Not(saved.id),
      },
      order: { createdAt: 'DESC' },
    });

    if (previousLevel) {
      this.logger.log(`Found previous level with id: ${previousLevel.id}, duplicating actions...`);

      // ✅ Step 2: Get all actions from previous level
      const previousActions = await this.approvalActionRepository.find({
        where: { approvalLevel: { id: previousLevel.id } },
      });

      this.logger.log(`Found ${previousActions.length} previous actions`);

      if (previousActions.length > 0) {
        // ✅ Step 3: Duplicate them for the new level
        const newActions = previousActions.map((act) =>
          this.approvalActionRepository.create({
            approvalLevel: { id: saved.id },
            user: { id: user.userId }, // creator of the new level
            name: act.name,
            description: act.description,
            action: act.action,
            entityName: act.entityName,
            entityId: act.entityId,
          }),
        );

        // ✅ Step 4: Save all new actions
        await this.approvalActionRepository.save(newActions);
        this.logger.log(`Saved ${newActions.length} duplicated actions for new level id: ${saved.id}`);
      } else {
        this.logger.log('No previous actions to duplicate');
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


  async findOne(id: string): Promise<ApprovalLevel> {
    const request = await this.approvalLevelRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    // const requestWithStatus = await this.attachApprovalInfo(
    //   request,
    //   'AssetRequest',
    //   user?.roleId,
    // );

    // return AssetRequestResponseDto.fromEntity(requestWithStatus);
    return plainToInstance(ApprovalLevel, request);
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
      level: dto.level,
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
  async deleteApprovalLevel(id: string, soft = true): Promise<void> {
    const level = await this.approvalLevelRepository.findOne({ where: { id } });
    if (!level) {
      throw new NotFoundException(`ApprovalLevel with ID ${id} not found`);
    }
    await this.approvalLevelRepository.remove(level);
  }

  /**
   * Notification logic
   */
  private async sendCreateLevelNotification(
    level: ApprovalLevel,
    role?: Role,
  ): Promise<void> {
    const context = {
      levelName: level.name,
      description: level.description,
      status: level.status,
    };

    let recipients: string[] = [];

    if (role) {
      const users = await this.userRepository.find({
        where: { role: { id: role.id } },
      });
      recipients = users.map((u) => u.email);
    }

    if (!recipients.length) return;

    // const dto: SendNotificationDto = {
    //   channel: NotificationChannelsEnum.EMAIL,
    //   notificationKeyword: NotificationKeywordEnum.CREATE_LEVEL,
    //   recipients,
    //   context,
    // };
    //
    // await this.notificationService.sendNotification(dto);
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
