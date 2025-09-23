// positions/position.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { plainToInstance } from 'class-transformer';
import { PositionResponseDto } from './dtos/position-response.dto';
import { CreatePositionDto } from './dtos/create-position.dto';
import { UpdatePositionDto } from './dtos/update-position.dto';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { BaseService } from '../../common/services/base-service';
import { PositionEntity } from './entities/position.entity';

@Injectable()
export class PositionService extends BaseService<PositionEntity> {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly repo: Repository<PositionEntity>,
  ) {
    super(repo);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<PositionResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['department'], // relations
      {
        fields: ['name'], // fields in contracts table
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
  async create(
    createPositionDto: CreatePositionDto,
  ): Promise<PositionResponseDto> {
    const position = this.repo.create(createPositionDto);
    const savedPosition = await this.repo.save(position);
    return plainToInstance(PositionResponseDto, savedPosition);
  }

  // Read One
  async findOne(id: string): Promise<PositionResponseDto> {
    const position = await this.repo.findOne({
      where: { id },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return plainToInstance(PositionResponseDto, position);
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

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

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
