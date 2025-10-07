// src/features/approval/services/user-approval.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserApproval } from '../entities/user-approval.entity';
import { SysApproval } from '../entities/system-approval.entity';

import {
  PaginationDto,
  PaginatedResponseDto,
} from '../../../common/dtos/pagination.dto';
import { BaseService } from '../../../common/services/base-service';
import { CreateUserApprovalDto } from '../dto/create-user-approval.dto';
import { UpdateUserApprovalDto } from '../dto/update-user-approval.dto';

@Injectable()
export class UserApprovalService extends BaseService<UserApproval> {
  constructor(
    @InjectRepository(UserApproval)
    private readonly userApprovalRepository: Repository<UserApproval>,
    @InjectRepository(SysApproval)
    private readonly sysApprovalRepository: Repository<SysApproval>,
  ) {
    super(userApprovalRepository);
  }

  /**
   * Get paginated list of user approvals
   */
  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<UserApproval>> {
    const response = await this.findAllPaginated(
      pagination,
      ['sysApproval'], // relations
      {
        fields: ['name', 'description'],
        relations: {
          sysApproval: ['name'],
        },
      },
    );

    return {
      ...response,
      data: response.data.map((approval) => ({
        ...approval,
        sysApproval: approval.sysApproval?.name ?? null,
      })),
    };
  }

  /**
   * Create a new UserApproval record
   */
  async createUserApproval(dto: CreateUserApprovalDto): Promise<UserApproval> {
    // Prevent duplicate for same SysApproval
    const existing = await this.userApprovalRepository.findOne({
      where: { sysApproval: { id: dto.sysApprovalId } },
      relations: ['sysApproval'],
    });
    if (existing) {
      throw new ConflictException(
        `Approval for system '${existing.sysApproval.name}' already exists`,
      );
    }

    const sysApproval = await this.validateSysApproval(dto.sysApprovalId);

    const newApproval = this.userApprovalRepository.create({
      name: dto.name,
      description: dto.description,
      sysApproval,
    });

    return this.userApprovalRepository.save(newApproval);
  }

  async findOne(id: string): Promise<UserApproval> {
    const userApproval = await this.userApprovalRepository.findOne({
      where: { id },
      relations: ['sysApproval'],
    });

    if (!userApproval) {
      throw new NotFoundException(`UserApproval with ID ${id} not found`);
    }

    return userApproval;
  }

  /**
   * Update an existing UserApproval record
   */
  async updateUserApproval(
    id: string,
    dto: UpdateUserApprovalDto,
  ): Promise<UserApproval> {
    const userApproval = await this.userApprovalRepository.findOne({
      where: { id },
      relations: ['sysApproval'],
    });

    if (!userApproval) {
      throw new NotFoundException(`UserApproval with ID ${id} not found`);
    }

    // Check duplicate name
    const duplicate = await this.userApprovalRepository.findOne({
      where: { name: dto.name },
    });

    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(
        `UserApproval with name '${dto.name}' already exists`,
      );
    }

    const sysApproval = await this.validateSysApproval(dto.sysApprovalId);

    Object.assign(userApproval, {
      name: dto.name,
      description: dto.description,
      sysApproval,
    });

    return this.userApprovalRepository.save(userApproval);
  }

  /**
   * Soft delete or hard delete a UserApproval
   */
  async deleteUserApproval(id: string, soft = true): Promise<void> {
    const userApproval = await this.userApprovalRepository.findOne({
      where: { id },
    });

    if (!userApproval) {
      throw new NotFoundException(`UserApproval with ID ${id} not found`);
    }

    await this.userApprovalRepository.remove(userApproval);
  }

  /**
   * Validate that SysApproval exists
   */
  private async validateSysApproval(
    sysApprovalId: string,
  ): Promise<SysApproval> {
    const sysApproval = await this.sysApprovalRepository.findOne({
      where: { id: sysApprovalId },
    });

    if (!sysApproval) {
      throw new NotFoundException(
        `System approval with ID ${sysApprovalId} not found`,
      );
    }

    return sysApproval;
  }
}
