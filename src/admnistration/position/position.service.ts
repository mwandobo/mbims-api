// positions/position.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { plainToInstance } from 'class-transformer';
import { PositionResponseDto } from './dtos/position-response.dto';
import { CreatePositionDto } from './dtos/create-position.dto';
import { UpdatePositionDto } from './dtos/update-position.dto';
import { PaginatedResponseDto, PaginationDto, } from '../../common/dtos/pagination.dto';
import { BaseService } from '../../common/services/base-service';
import { PositionEntity } from './entities/position.entity';
import { DepartmentEntity } from '../department/entities/department.entity';

@Injectable()
export class PositionService extends BaseService<PositionEntity> {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly repo: Repository<PositionEntity>,

    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
  ) {
    super(repo);
  }
  private readonly logger = new Logger(PositionService.name);

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<PositionResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['department'], // relations
      {
        fields: ['name', 'description'],
        relations:{
          department: ['name'], // search supplier.name and supplier.email
        },
      },
    );

    return {
      ...response,
      data: response.data.map((position) =>
        PositionResponseDto.fromPosition(position),
      ),
    };
  }

  // Create
  async create(dto: CreatePositionDto): Promise<PositionResponseDto> {
    this.logger.log(dto );
    const { department_id, ...createPositionDto } = dto;
    const department = await this.validateDepartment(department_id);
    const position = this.repo.create({ department, ...createPositionDto });

    const savedPosition = await this.repo.save(position);
    return plainToInstance(PositionResponseDto, savedPosition);
  }

  // Read One
  async findOne(id: string): Promise<PositionResponseDto> {
    const position = await this.repo.findOne({
      where: { id },
      relations: ['department']
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return PositionResponseDto.fromPosition(position);
  }

  private async validateDepartment(
    departmentId: string,
  ): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }
    return department;
  }

  // Update
  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
  ): Promise<PositionResponseDto> {
    const position = await this.repo.preload({
      id,
      ...updatePositionDto,
    });

    const { department_id, ...dto } = updatePositionDto;

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    position.department = await this.validateDepartment(department_id);
    const updatedPosition = await this.repo.save(position);
    return plainToInstance(PositionResponseDto, updatedPosition);
  }

  // Delete
  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
  }

  // Get Statistics (example)
  async getStats(): Promise<{ count: number }> {
    const count = await this.repo.count();
    return { count };
  }
}
