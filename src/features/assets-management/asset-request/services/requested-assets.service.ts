import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AssetRequestItemEntity } from '../entity/asset-request-item.entity';
import { AssetEntity } from '../../asset/asset.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../../common/dtos/pagination.dto';
import { CreateAssetRequestItemDto } from '../dtos/create-asset-request-item.dto';
import { UpdateAssetRequestItemDto } from '../dtos/update-asset-request-item.dto';
import { AssetRequestEntity } from '../entity/asset-request.entity';
import { AssetRequestItemResponseDto } from '../dtos/asset-request-item-response.dto';
import { BaseService } from '../../../../common/services/base-service';

@Injectable()
export class RequestedAssetsService extends BaseService<AssetRequestItemEntity> {
  private readonly logger = new Logger(RequestedAssetsService.name);

  constructor(
    @InjectRepository(AssetRequestItemEntity)
    private readonly repo: Repository<AssetRequestItemEntity>,

    @InjectRepository(AssetRequestEntity)
    private readonly requestRepo: Repository<AssetRequestEntity>,

    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
  ) {
    super(repo);
  }

  async findAll(
    pagination: PaginationDto,
    requestId: string
  ): Promise<PaginatedResponseDto<AssetRequestItemResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['asset.category'], // load request items and their assets
      { fields: [] },
      { request: requestId }, // <-- filter by request
  );

    return {
      ...response,
      data: response.data.map((user) => {
        const dto = AssetRequestItemResponseDto.fromEntity(user);
        dto['approvalStatus'] = (user as any).approvalStatus ?? 'N/A';
        dto['shouldApprove'] = (user as any).shouldApprove ?? 'N/A';
        dto['isMyLevelApproved'] = (user as any).isMyLevelApproved ?? 'N/A';
        return dto;
      }),
    };
  }

  async create(
    dto: CreateAssetRequestItemDto,
    requestId: string,
  ): Promise<AssetRequestItemResponseDto> {
    // Fetch the request entity
    const request = await this.requestRepo.findOne({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException(`Request not found`);

    const asset = await this.assetRepo.findOne({
      where: { id: dto.asset_id },
    });
    if (!asset) throw new NotFoundException(`Asset not found`);

    const requestedItem = this.repo.create({ asset, request });

    const savedItem = await this.repo.save(requestedItem);
    return AssetRequestItemResponseDto.fromEntity(savedItem);
  }

  // Get a single requested asset item by id
  async findOne(id: string): Promise<any> {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['asset', 'asset.category', 'request'],
    });

    if (!item)
      throw new NotFoundException(
        `Requested asset item with ID ${id} not found`,
      );

    return {
      id: item.id,
      quantity: item.quantity,
      assetName: item.asset?.name,
      categoryName: item.asset?.category?.name,
      requestId: item.request?.id,
      requestName: item.request?.name,
    };
  }

  async update(
    id: string,
    dto: UpdateAssetRequestItemDto,
    requestId: string,
  ): Promise<AssetRequestItemResponseDto> {
    // Find the existing asset request item
    const item = await this.repo.findOne({
      where: { id },
      relations: ['asset', 'request'], // load relations if needed
    });

    if (!item) throw new NotFoundException(`Asset request item not found`);


    if (dto.asset_id) {
      const asset = await this.assetRepo.findOne({
        where: { id: dto.asset_id },
      });
      if (!asset) throw new NotFoundException(`Asset not found`);
      item.asset = asset;
    }

    // Save the changes
    const updatedItem = await this.repo.save(item);

    return AssetRequestItemResponseDto.fromEntity(updatedItem);
  }


  // Delete a requested asset item
  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Requested asset item with ID ${id} not found`,
      );
    }
  }
}
