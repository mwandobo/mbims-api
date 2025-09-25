// asset-request/asset-request.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/services/base-service';
import { AssetRequestEntity } from './entity/asset-request.entity';
import { AssetRequestItemEntity } from './entity/asset-request-item.entity';

import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { AssetEntity } from '../asset/asset.entity';
import { AssetRequestResponseDto } from './dtos/asset-request-response.dto';
import { CreateAssetRequestDto } from './dtos/create-asset-request.dto';
import { UpdateAssetRequestDto } from './dtos/update-asset-request.dto';

@Injectable()
export class AssetRequestService extends BaseService<AssetRequestEntity> {
  private readonly logger = new Logger(AssetRequestService.name);

  constructor(
    @InjectRepository(AssetRequestEntity)
    private readonly repo: Repository<AssetRequestEntity>,

    @InjectRepository(AssetRequestItemEntity)
    private readonly itemRepo: Repository<AssetRequestItemEntity>,

    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
  ) {
    super(repo);
  }

  // Find all requests with pagination
  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<AssetRequestResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['items', 'items.asset'], // load request items and their assets
      { fields: [] },
    );

    return {
      ...response,
      data: response.data.map((req) => AssetRequestResponseDto.fromEntity(req)),
    };
  }

  // Create a new request with items
  async create(dto: CreateAssetRequestDto): Promise<AssetRequestResponseDto> {
    this.logger.log(`Creating asset request: ${JSON.stringify(dto)}`);

    const request = this.repo.create(dto);
    const savedRequest = await this.repo.save(request);

    const items: AssetRequestItemEntity[] = [];
    for (const { asset_id, quantity } of dto.items) {
      const asset = await this.assetRepo.findOne({ where: { id: asset_id } });
      if (!asset) {
        throw new NotFoundException(`Asset with ID ${asset_id} not found`);
      }
      const item = this.itemRepo.create({
        request: savedRequest,
        asset,
        quantity,
      });
      items.push(await this.itemRepo.save(item));
    }

    savedRequest.items = items;
    return AssetRequestResponseDto.fromEntity(savedRequest);
  }

  // Read one request
  async findOne(id: string): Promise<AssetRequestResponseDto> {
    const request = await this.repo.findOne({
      where: { id },
      relations: ['items', 'items.asset'],
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    return AssetRequestResponseDto.fromEntity(request);
  }

  // Update a request (replace items)
  async update(
    id: string,
    dto: UpdateAssetRequestDto,
  ): Promise<AssetRequestResponseDto> {
    const request = await this.repo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    // Remove old items
    await this.itemRepo.delete({ request: { id } });

    // Add new items
    const items: AssetRequestItemEntity[] = [];
    for (const { asset_id, quantity } of dto.items) {
      const asset = await this.assetRepo.findOne({ where: { id: asset_id } });
      if (!asset) {
        throw new NotFoundException(`Asset with ID ${asset_id} not found`);
      }
      const item = this.itemRepo.create({ request, asset, quantity });
      items.push(await this.itemRepo.save(item));
    }

    request.items = items;
    return AssetRequestResponseDto.fromEntity(request);
  }

  // Delete a request
  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }
  }

  // Simple stats
  async getStats(): Promise<{ count: number }> {
    const count = await this.repo.count();
    return { count };
  }
}
