// asset-request/dto/asset-request-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { AssetRequestItemEntity } from '../entity/asset-request-item.entity';

export class AssetRequestItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  requestName: string;

  @Expose()
  categoryName: string;

  @Expose()
  assetName: string;

  static fromEntity(
    entity: AssetRequestItemEntity,
  ): AssetRequestItemResponseDto {
    const dto = new AssetRequestItemResponseDto();
    dto.id = entity.id;
    dto.requestName = entity.request?.name;
    dto.assetName = entity.asset?.name ?? '';
    dto.categoryName = entity.asset?.category?.name ?? '';
    return dto;
  }
}
