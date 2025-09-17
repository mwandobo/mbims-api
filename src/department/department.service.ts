// departments/department.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

import { plainToInstance } from 'class-transformer';
import { DepartmentResponseDto } from './dtos/department-response.dto';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../common/dtos/pagination.dto';
import { BaseService } from '../common/services/base-service';

@Injectable()
export class DepartmentService extends BaseService<Department> {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {
    super(departmentRepository);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      [], // relations
      {
        fields: ['name'], // fields in contracts table
      },
    );

    return {
      ...response,
      data: response.data.map((department) =>
        DepartmentResponseDto.fromDepartment(department),
      ),
    };
  }

  // Create
  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = this.departmentRepository.create(createDepartmentDto);
    const savedDepartment = await this.departmentRepository.save(department);
    return plainToInstance(DepartmentResponseDto, savedDepartment);
  }

  // Read One
  async findOne(id: string): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return plainToInstance(DepartmentResponseDto, department);
  }

  // Update
  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.preload({
      id,
      ...updateDepartmentDto,
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const updatedDepartment = await this.departmentRepository.save(department);
    return plainToInstance(DepartmentResponseDto, updatedDepartment);
  }

  // Delete
  async remove(id: string): Promise<void> {
    const result = await this.departmentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  // Get Statistics (example)
  async getStats(): Promise<{ count: number }> {
    const count = await this.departmentRepository.count();
    return { count };
  }
}
