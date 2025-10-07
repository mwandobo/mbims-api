import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApprovalLevel } from '../entities/approval-level.entity';
import { UserApproval } from '../entities/user-approval.entity';

import { StatusEnum } from '../enums/status.enum';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dtos/pagination.dto';
import { BaseService } from '../../../common/services/base-service';
import { Role } from '../../../admnistration/roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { NotificationService } from '../../../notification/notification.service';
import { CreateApprovalLevelDto } from '../dto/create-approval-level.dto';
import { UpdateApprovalLevelDto } from '../dto/update-approval-level.dto';

@Injectable()
export class ApprovalLevelService extends BaseService<ApprovalLevel> {
  constructor(
    @InjectRepository(ApprovalLevel)
    private readonly approvalLevelRepository: Repository<ApprovalLevel>,

    @InjectRepository(UserApproval)
    private readonly userApprovalRepository: Repository<UserApproval>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // private readonly notificationService: NotificationService,
  ) {
    super(approvalLevelRepository);
  }

  /**
   * Get all approval levels with pagination
   */
  async findAll(
    pagination: PaginationDto,
    userApprovalId: String
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




  async createApprovalLevel(
    dto: CreateApprovalLevelDto,
  ): Promise<ApprovalLevel> {
    const approvalLevel = this.approvalLevelRepository.create({
      name: dto.name,
      description: dto.description,
      level: dto.level,
    });

    // Validate relations
    const userApproval = await this.validateUserApproval(dto.userApprovalId);
    approvalLevel.userApproval = userApproval;

    let role: Role | null = null;
    let user: User | null = null;

    if (dto.roleId) {
      role = await this.validateRole(dto.roleId);
      approvalLevel.role = role;
    }

    if (dto.userId) {
      user = await this.validateUser(dto.userId);
      approvalLevel.user = user;
    }

    const saved = await this.approvalLevelRepository.save(approvalLevel);

    // Send notifications
    await this.sendCreateLevelNotification(saved, role, user);

    return saved;
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
    user?: User,
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
    } else if (user) {
      recipients = [user.email];
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
