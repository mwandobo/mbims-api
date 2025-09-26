// departments/asset-category.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { BaseService } from '../../common/services/base-service';
import { AssetCategoryEntity } from './asset-category.entity';
import {
  AssetCategoryResponseDto,
} from './dtos/asset-category-response.dto';
import { CreateAssetCategoryDto } from './dtos/create-asset-category.dto';
import { UpdateAssetCategoryDto } from './dtos/update-asset-category.dto';
import { AssetEntity } from '../asset/asset.entity';

@Injectable()
export class AssetCategoryService extends BaseService<AssetCategoryEntity> {
  constructor(
    @InjectRepository(AssetCategoryEntity)
    private readonly repo: Repository<AssetCategoryEntity>,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
  ) {
    super(repo);
  }

  // Find all with pagination
  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AssetCategoryResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      [], // relations
      { fields: ['name'] }, // select fields
    );

    return {
      ...response,
      data: response.data.map((assetCategory) =>
        AssetCategoryResponseDto.fromAssetCategory(assetCategory),
      ),
    };
  }

  // Create
  async create(
    createDto: CreateAssetCategoryDto,
  ): Promise<AssetCategoryResponseDto> {
    const entity = this.repo.create(createDto);
    const saved = await this.repo.save(entity);
    return AssetCategoryResponseDto.fromAssetCategory(saved);
  }

  // Read One
  async findOne(id: string): Promise<AssetCategoryResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });

    if (!entity) {
      throw new NotFoundException(`Asset Category with ID ${id} not found`);
    }

    return AssetCategoryResponseDto.fromAssetCategory(entity);
  }

  // Update
  async update(
    id: string,
    updateDto: UpdateAssetCategoryDto,
  ): Promise<AssetCategoryResponseDto> {
    const entity = await this.repo.preload({ id, ...updateDto });

    if (!entity) {
      throw new NotFoundException(`Asset Category with ID ${id} not found`);
    }

    const updated = await this.repo.save(entity);
    return AssetCategoryResponseDto.fromAssetCategory(updated);
  }

  // Delete
  // async remove(id: string): Promise<void> {
  //   const result = await this.repo.delete(id);
  //
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Asset Category with ID ${id} not found`);
  //   }
  // }

  async remove(id: string) {
    const assetsCount = await this.assetRepository.count({
      where: { category: { id } },
    });

    if (assetsCount > 0) {
      throw new BadRequestException(
        'Cannot delete category because assets are still linked to it.',
      );
    }

    return this.repo.delete(id);
  }


  // Get Statistics (example)
  async getStats(): Promise<{ count: number }> {
    const count = await this.repo.count();
    return { count };
  }
}
