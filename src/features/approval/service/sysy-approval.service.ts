// src/features/approval/services/sys-approval.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dtos/pagination.dto';
import { SysApproval } from '../entities/system-approval.entity';
import { BaseService } from '../../../common/services/base-service';
import { SysApprovalResponseDto } from '../dto/sys-approval.dto';

@Injectable()
export class SysApprovalService extends BaseService<SysApproval> {
  constructor(
    @InjectRepository(SysApproval)
    private readonly repo: Repository<SysApproval>,
  ) {
    super(repo);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SysApprovalResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      [], // relations
      {
        fields: ['name', 'description'],
      },
    );

    return {
      ...response,
      data: response.data.map((party) =>
        SysApprovalResponseDto.fromSysApprovals(party),
      ),
    };
  }
}
