import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AssetRequestItemEntity } from '../entity/asset-request-item.entity';
import { AssetEntity } from '../../asset/asset.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dtos/pagination.dto';
import { CreateAssetRequestItemDto } from '../dtos/create-asset-request-item.dto';
import { UpdateAssetRequestItemDto } from '../dtos/update-asset-request-item.dto';
import { AssetRequestEntity } from '../entity/asset-request.entity';

@Injectable()
export class RequestedAssetsService {
  private readonly logger = new Logger(RequestedAssetsService.name);

  constructor(
    @InjectRepository(AssetRequestItemEntity)
    private readonly repo: Repository<AssetRequestItemEntity>,

    @InjectRepository(AssetRequestEntity)
    private readonly requestRepo: Repository<AssetRequestEntity>,


    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
  ) {}

  // Create a requested asset item
  // async create(
  //   dto: CreateAssetRequestItemDto,
  // ): Promise<AssetRequestItemEntity[]> {
  //   const asset = await this.assetRepo.findOne({ where: { id: dto.asset_id } });
  //   if (!asset) {
  //     throw new NotFoundException(`Asset with ID ${dto.asset_id} not found`);
  //   }
  //
  //   const item = this.itemRepo.create({
  //     asset,
  //     request: { id: dto.requestId }, // just assign request id
  //   } as any); // cast to satisfy TypeORM relations
  //   return this.itemRepo.save(item);
  // }

  // Create multiple requested asset items
  // async create(
  //   dto: CreateAssetRequestItemDto,
  // ): Promise<AssetRequestItemEntity[]> {
  //   const items: AssetRequestItemEntity[] = [];
  //
  //   for (const asset_id of dto.asset_ids) {
  //     const asset = await this.assetRepo.findOne({ where: { id: asset_id } });
  //     if (!asset) {
  //       throw new NotFoundException(`Asset with ID ${asset_id} not found`);
  //     }
  //
  //     const item = this.itemRepo.create({
  //       asset,
  //       request: { id: dto.requestId }, // assign request ID directly
  //     } as any);
  //
  //     items.push(await this.itemRepo.save(item));
  //   }
  //
  //   return items;
  // }

  // async create(dto: CreateAssetRequestItemDto): Promise<AssetRequestItemEntity[]> {
  //   const items: AssetRequestItemEntity[] = [];
  //
  //   for (const asset_id of dto.asset_ids) {
  //     const asset = await this.assetRepo.findOne({ where: { id: asset_id } });
  //     if (!asset) {
  //       throw new NotFoundException(`Asset with ID ${asset_id} not found`);
  //     }
  //
  //     const item = this.itemRepo.create({
  //       asset,
  //       request: { id: dto.requestId },
  //     } as any);
  //
  //     items.push(await this.itemRepo.save(item));
  //   }
  //
  //   return items; // ✅ array of saved items
  // }

  // async create(
  //   dto: CreateAssetRequestItemDto,
  // ): Promise<AssetRequestItemEntity> {
  //   const items: AssetRequestItemEntity[] = [];
  //
  //   for (const asset_id of dto.asset_ids) {
  //     const asset = await this.assetRepo.findOne({ where: { id: asset_id } });
  //     if (!asset) {
  //       throw new NotFoundException(`Asset with ID ${asset_id} not found`);
  //     }
  //
  //     const item = this.itemRepo.create({
  //       asset,
  //       request: { id: dto.requestId },
  //     } as any);
  //
  //     items.push(await this.itemRepo.save(item));
  //   }
  //
  //   return items[0]; // only the first item
  // }
  //
  // async create(
  //   dto: CreateAssetRequestItemDto,
  // ): Promise<AssetRequestItemEntity[]> {
  //   const assets = await this.assetRepo.findByIds(dto.asset_ids); // fetch all assets at once
  //   if (assets.length !== dto.asset_ids.length) {
  //     const missingIds = dto.asset_ids.filter(
  //       (id) => !assets.find((a) => a.id === id),
  //     );
  //     throw new NotFoundException(`Assets not found: ${missingIds.join(', ')}`);
  //   }
  //
  //   const items = assets.map((asset) =>
  //     this.itemRepo.create({
  //       asset,
  //       request: { id: dto.requestId },
  //     } as any)
  //   );
  //
  //   return this.itemRepo.save(items); // returns AssetRequestItemEntity[]
  // }
  //
  //

  async create(
    dto: CreateAssetRequestItemDto,
    requestId: string,
  ): Promise<{ message: string }> {

    console.log('requestId', requestId)
    // Fetch the request entity
    const request = await this.requestRepo.findOne({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException(`Request not found`);

    // Fetch all assets
    const assets = await this.assetRepo.find({
      where: { id: In(dto.asset_ids) },
    });
    if (assets.length !== dto.asset_ids.length) {
      const missingIds = dto.asset_ids.filter(
        (id) => !assets.find((a) => a.id === id),
      );
      throw new NotFoundException(`Assets not found: ${missingIds.join(', ')}`);
    }

    // Create and save items
    const items = assets.map((asset) =>
      this.repo.create({ asset, request }),
    );
    await this.repo.save(items);

    // Return success message
    return { message: `Successfully added ${items.length} requested asset(s)` };
  }

  // Get paginated requested assets
  // async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<any>> {
  //   const [items, total] = await this.itemRepo.findAndCount({
  //     relations: ['asset', 'asset.category', 'request'],
  //     skip: (pagination.page - 1) * pagination.limit,
  //     take: pagination.limit,
  //     order: { createdAt: 'DESC' },
  //   });
  //
  //   const formatted = items.map((item) => ({
  //     id: item.id,
  //     quantity: item.quantity,
  //     assetName: item.asset?.name,
  //     categoryName: item.asset?.category?.name,
  //     requestId: item.request?.id,
  //     requestName: item.request?.name,
  //   }));
  //
  //   return new PaginatedResponseDto(formatted, total, pagination);
  // }

  // Get paginated requested assets with optional requestId filter
  async findAll(
    pagination: PaginationDto,
    requestId?: string, // optional query filter
  ): Promise<PaginatedResponseDto<any>> {
    // Build dynamic where clause
    const where: any = {};
    if (requestId) {
      where.request = { id: requestId };
    }

    const [items, total] = await this.repo.findAndCount({
      where,
      relations: ['asset', 'asset.category', 'request'],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
    });

    const formatted = items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      assetName: item.asset?.name,
      categoryName: item.asset?.category?.name,
      requestId: item.request?.id,
      requestName: item.request?.name,
    }));

    return new PaginatedResponseDto(formatted, total, pagination);
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

  // // Update a requested asset item
  // async update(id: string, dto: UpdateAssetRequestItemDto): Promise<any> {
  //   const item = await this.itemRepo.findOne({ where: { id } });
  //   if (!item)
  //     throw new NotFoundException(
  //       `Requested asset item with ID ${id} not found`,
  //     );
  //
  //
  //   if (dto.asset_id) {
  //     const asset = await this.assetRepo.findOne({
  //       where: { id: dto.asset_id },
  //     });
  //     if (!asset)
  //       throw new NotFoundException(`Asset with ID ${dto.asset_id} not found`);
  //     item.asset = asset;
  //   }
  //
  //   return this.itemRepo.save(item);
  // }

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
