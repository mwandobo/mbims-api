// asset-request/dto/asset-request-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { AssetRequestEntity } from '../entity/asset-request.entity';
import { AssetRequestItemEntity } from '../entity/asset-request-item.entity';

class AssetRequestItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  quantity: number;

  @Expose()
  assetName: string;

  static fromEntity(
    entity: AssetRequestItemEntity,
  ): AssetRequestItemResponseDto {
    const dto = new AssetRequestItemResponseDto();
    dto.id = entity.id;
    dto.quantity = entity.quantity;
    dto.assetName = entity.asset?.name ?? '';
    return dto;
  }
}

export class AssetRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => AssetRequestItemResponseDto)
  items: AssetRequestItemResponseDto[];

  static fromEntity(entity: AssetRequestEntity): AssetRequestResponseDto {
    const dto = new AssetRequestResponseDto();
    dto.id = entity.id;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.items = entity.items?.map((item) =>
      AssetRequestItemResponseDto.fromEntity(item),
    ) ?? [];
    return dto;
  }
}
