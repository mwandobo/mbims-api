// asset-request/asset-request.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base-service';
import { AssetRequestEntity } from '../entity/asset-request.entity';
import { AssetRequestItemEntity } from '../entity/asset-request-item.entity';

import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dtos/pagination.dto';
import { AssetEntity } from '../../asset/asset.entity';
import { AssetRequestResponseDto } from '../dtos/asset-request-response.dto';
import { CreateAssetRequestDto } from '../dtos/create-asset-request.dto';

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
      ['items', 'items.asset', 'items.asset.category'], // load request items and their assets
      { fields: [] },
    );

    return {
      ...response,
      data: response.data.map((req) => AssetRequestResponseDto.fromEntity(req)),
    };
  }

  async create(dto: CreateAssetRequestDto): Promise<AssetRequestResponseDto> {
    this.logger.log(`Creating asset request: ${JSON.stringify(dto)}`);

    const request = this.repo.create({
      name: dto.name,
      description: dto.description,
    });
    const savedRequest = await this.repo.save(request);

    const items: AssetRequestItemEntity[] = [];
    for (const asset_id of dto.asset_ids) {
      const asset = await this.assetRepo.findOne({ where: { id: asset_id } });
      if (!asset) {
        throw new NotFoundException(`Asset with ID ${asset_id} not found`);
      }

      const item = this.itemRepo.create({
        request: savedRequest,
        asset,
        quantity: 1, // default
      });
      items.push(await this.itemRepo.save(item));
    }

    savedRequest.items = items;

    // ✅ keep using response DTO for output
    return AssetRequestResponseDto.fromEntity(savedRequest);
  }

  // Read one request
  async findOne(id: string): Promise<AssetRequestResponseDto> {
    const request = await this.repo.findOne({
      where: { id },
      relations: ['items', 'items.asset', 'items.asset.category'],
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    return AssetRequestResponseDto.fromEntity(request);
  }

  // Update a request (replace items)
  async update(
    id: string,
    // dto: UpdateAssetRequestDto,
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
    // for (const { asset_id, quantity } of dto.items) {
    //   const asset = await this.assetRepo.findOne({ where: { id: asset_id } });
    //   if (!asset) {
    //     throw new NotFoundException(`Asset with ID ${asset_id} not found`);
    //   }
    //   const item = this.itemRepo.create({ request, asset, quantity });
    //   items.push(await this.itemRepo.save(item));
    // }

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

  // asset-request/asset-request.service.ts
  // async findAssetsByRequestId(
  //   requestId: string,
  //   pagination: PaginationDto,
  // ): Promise<PaginatedResponseDto<AssetRequestResponseDto>> {
  //   // Ensure the request exists
  //   const request = await this.repo.findOne({ where: { id: requestId } });
  //   if (!request) {
  //     throw new NotFoundException(
  //       `Asset request with ID ${requestId} not found`,
  //     );
  //   }
  //
  //   // Paginate only the items for this request
  //   const [items, total] = await this.itemRepo.findAndCount({
  //     where: { request: { id: requestId } },
  //     relations: ['asset', 'asset.category'],
  //     skip: (pagination.page - 1) * pagination.limit,
  //     take: pagination.limit,
  //     order: { createdAt: 'DESC' },
  //   });
  //
  //   // const data = items.map((item) =>
  //   //   AssetRequestResponseDto.fromEntity({ ...request, items: [item] }),
  //   // );
  //
  //
  //
  //   return new PaginatedResponseDto(data, total, pagination);
  // }
  //

  // async findAssetsByRequestId(
  //   requestId: string,
  //   pagination: PaginationDto,
  // ): Promise<PaginatedResponseDto<AssetRequestResponseDto>> {
  //   const request = await this.repo.findOne({ where: { id: requestId } });
  //   if (!request) {
  //     throw new NotFoundException(
  //       `Asset request with ID ${requestId} not found`,
  //     );
  //   }
  //
  //   const [items, total] = await this.itemRepo.findAndCount({
  //     where: { request: { id: requestId } },
  //     relations: ['asset', 'asset.category'],
  //     skip: (pagination.page - 1) * pagination.limit,
  //     take: pagination.limit,
  //     order: { createdAt: 'DESC' },
  //   });
  //
  //   const data = items.map((item) => {
  //     const reqWithOneItem = Object.assign(
  //       new AssetRequestEntity(),
  //       request,
  //       { items: [item] },
  //     );
  //     return AssetRequestResponseDto.fromEntity(reqWithOneItem);
  //   });
  //
  //   return new PaginatedResponseDto(data, total, pagination);
  // }
  //

  // asset-request/asset-request.service.ts
  async findAssetsByRequestId(
    requestId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    // Ensure request exists
    const request = await this.repo.findOne({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException(
        `Asset request with ID ${requestId} not found`,
      );
    }

    // Paginate only the items for this request
    const [items, total] = await this.itemRepo.findAndCount({
      where: { request: { id: requestId } },
      relations: ['asset', 'asset.category'],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
    });

    // Transform items into clean response
    const formattedItems = items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      assetName: item.asset?.name,
      categoryName: item.asset?.category?.name,
    }));

    return new PaginatedResponseDto(formattedItems, total, pagination);
  }

  // asset-request/asset-request.service.ts

  async findAssetItemById(
    requestId: string,
    itemId: string,
  ): Promise<any> {
    // Ensure request exists
    const request = await this.repo.findOne({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException(
        `Asset request with ID ${requestId} not found`,
      );
    }

    // Find specific item under this request
    const item = await this.itemRepo.findOne({
      where: { id: itemId, request: { id: requestId } },
      relations: ['asset', 'asset.category'],
    });

    if (!item) {
      throw new NotFoundException(
        `Item with ID ${itemId} not found in request ${requestId}`,
      );
    }

    // Transform into clean response
    return {
      id: item.id,
      quantity: item.quantity,
      assetName: item.asset?.name,
      categoryName: item.asset?.category?.name,
    };


  }

  // asset-request/asset-request.service.ts
  async findAssetItemByIdv1(itemId: string): Promise<any> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['asset', 'asset.category', 'request'],
    });

    if (!item) {
      throw new NotFoundException(`Requested asset item with ID ${itemId} not found`);
    }

    // Transform to a clean response
    return {
      id: item.id,
      quantity: item.quantity,
      assetName: item.asset?.name,
      categoryName: item.asset?.category?.name,
      requestId: item.request?.id,
      requestName: item.request?.name,
    };
  }


}
