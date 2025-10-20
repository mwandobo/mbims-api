import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
import { AssetRequestResponseDto } from '../../assets-management/asset-request/dtos/asset-request-response.dto';

@Injectable()
export class ApprovalActionService extends BaseService<ApprovalAction> {
  constructor(
    @InjectRepository(ApprovalAction)
    private readonly approvalActionRepository: Repository<ApprovalAction>,

    @InjectRepository(ApprovalLevel)
    private readonly approvalLevelRepository: Repository<ApprovalLevel>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(approvalActionRepository);
  }

  /**
   * Get all approval actions with optional search
   */
  // async findAll(
  //   pagination: PaginationDto,
  //   approvalLevel?: string,
  //   entityId?:string
  // ): Promise<PaginatedResponseDto<ApprovalAction>> {
  //   const query = this.approvalActionRepository
  //     .createQueryBuilder('action')
  //     .leftJoinAndSelect('action.approvalLevel', 'approvalLevel')
  //     .leftJoinAndSelect('action.user', 'user')
  //     .take(pagination.limit)
  //     .skip((pagination.page - 1) * pagination.limit);
  //
  //   if (search) {
  //     query.andWhere('LOWER(action.name) LIKE LOWER(:search)', {
  //       search: `%${search}%`,
  //     });
  //   }
  //
  //   const [data, total] = await query.getManyAndCount();
  //   return new PaginatedResponseDto(data, total, pagination);
  // }



  async findAll(
    pagination: PaginationDto,
    approvalLevel?: string,
    entityId?: string
  ): Promise<PaginatedResponseDto<ApprovalAction>> {
    const query = this.approvalActionRepository
      .createQueryBuilder('action')
      .leftJoinAndSelect('action.approvalLevel', 'approvalLevel')
      .leftJoinAndSelect('action.user', 'user')
      .take(pagination.limit)
      .skip((pagination.page - 1) * pagination.limit);

    // 🔹 Filter by entityId (if provided)
    if (entityId) {
      query.andWhere('action.entityId = :entityId', { entityId });
    }

    // 🔹 Filter by approvalLevel (if provided)
    if (approvalLevel) {
      query.andWhere('approvalLevel.id = :approvalLevel', { approvalLevel });
    }

    const [data, total] = await query.getManyAndCount();
    return new PaginatedResponseDto(data, total, pagination);
  }



  // Find all requests with pagination
  // async findAll(
  //   pagination: PaginationDto,
  // ): Promise<PaginatedResponseDto<AssetRequestResponseDto>> {
  //   const response = await this.findAllPaginated(
  //     pagination,
  //     ['user'], // load request items and their assets
  //     { fields: [] },
  //   );
  //
  //   return {
  //     ...response,
  //     data: response.data.map((user) => {
  //       const dto = AssetRequestResponseDto.fromEntity(user);
  //       dto['approvalStatus'] = (user as any).approvalStatus ?? 'N/A';
  //       dto['shouldApprove'] = (user as any).shouldApprove ?? 'N/A';
  //       dto['isMyLevelApproved'] = (user as any).isMyLevelApproved ?? 'N/A';
  //       return dto;
  //     }),
  //   };
  // }




  /**
   * Create a new approval action
   */
  async create(
    dto: CreateApprovalActionDto,
    currentUser: any,
  ): Promise<ApprovalAction> {

    const approvalLevel = await this.approvalLevelRepository.findOne({
      where: { id: dto.approvalLevelId },
    });
    if (!approvalLevel) throw new NotFoundException('Approval Level not found');

    console.log('entityid', dto.entityId)
    console.log('levelid', dto.approvalLevelId)

    // Check duplicate
    const existing = await this.approvalActionRepository.findOne({
      where: {
        approvalLevel: { id: dto.approvalLevelId },
        entityId: dto.entityId
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
      approvalLevel: { id: approvalLevel.id }, // only the ID
      user: { id: user.id },
      name: dto.name,
      description: dto.description,
      action: dto.action as ApprovalActionEnum, // ✅ cast string to enum
      entityName: dto.entityName,
      entityId: dto.entityId,
    });

    return this.approvalActionRepository.save(action);
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
