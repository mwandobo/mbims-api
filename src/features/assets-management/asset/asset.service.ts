// assets/asset-request.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { AssetCategoryEntity } from '../asset-category/asset-category.entity';
import { AssetResponseDto } from './dtos/asset-response.dto';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { UpdateAssetDto } from './dtos/update-asset.dto';
import { BaseService } from '../../../common/services/base-service';
import { AssetEntity } from './asset.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dtos/pagination.dto';
import { AssetRequestItemEntity } from '../asset-request/entity/asset-request-item.entity';

@Injectable()
export class AssetService extends BaseService<AssetEntity> {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly repo: Repository<AssetEntity>,

    @InjectRepository(AssetCategoryEntity)
    private readonly categoryRepository: Repository<AssetCategoryEntity>,

    @InjectRepository(AssetRequestItemEntity)
    private readonly AssetRequestItemRepository: Repository<AssetRequestItemEntity>,
  ) {
    super(repo);
  }

  private readonly logger = new Logger(AssetService.name);

  // Find All with pagination
  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AssetResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['category'], // relations
      {
        fields: ['name', 'description'],
        relations: {
          category: ['name'], // allow searching by category.name
        },
      },
    );

    return {
      ...response,
      data: response.data.map((asset) => AssetResponseDto.fromAsset(asset)),
    };
  }

  // Create
  async create(dto: CreateAssetDto): Promise<AssetResponseDto> {
    this.logger.log(dto);

    const { category_id, ...createAssetDto } = dto;
    const category = await this.validateCategory(category_id);

    const asset = this.repo.create({ category, ...createAssetDto });
    const savedAsset = await this.repo.save(asset);
    return plainToInstance(AssetResponseDto, savedAsset);
  }

  // Read One
  async findOne(id: string): Promise<AssetResponseDto> {
    const asset = await this.repo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return AssetResponseDto.fromAsset(asset);
  }

  // Update
  async update(
    id: string,
    updateDto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    const asset = await this.repo.preload({ id, ...updateDto });

    const { category_id, ...dto } = updateDto;

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    asset.category = await this.validateCategory(category_id);

    const updatedAsset = await this.repo.save(asset);
    return plainToInstance(AssetResponseDto, updatedAsset);
  }

  // Delete
  async remove(id: string): Promise<void> {
    const assetRequestItemsCount = await this.AssetRequestItemRepository.count({
      where: { asset: { id } },
    });

    if (assetRequestItemsCount > 0) {
      throw new BadRequestException(
        'Cannot delete Asset because requests are still linked to it.',
      );
    }

    const result = await this.repo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
  }

  // Get statistics
  async getStats(): Promise<{ count: number }> {
    const count = await this.repo.count();
    return { count };
  }

  // Validate category
  private async validateCategory(
    categoryId: string,
  ): Promise<AssetCategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Asset category with ID ${categoryId} not found`,
      );
    }
    return category;
  }
}
