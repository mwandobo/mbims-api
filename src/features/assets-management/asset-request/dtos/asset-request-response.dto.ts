// asset-request/dto/asset-request-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { AssetRequestEntity } from '../entity/asset-request.entity';
import { AssetRequestItemEntity } from '../entity/asset-request-item.entity';
import { format } from 'date-fns';
import { AssetResponseDto } from '../../asset/dtos/asset-response.dto';

class AssetRequestItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  quantity: number;

  @Expose()
  assetName: string;

  @Expose()
  categoryName: string;

  static fromEntity(
    entity: AssetRequestItemEntity,
  ): AssetRequestItemResponseDto {
    const dto = new AssetRequestItemResponseDto();
    dto.id = entity.id;
    dto.quantity = entity.quantity;
    dto.assetName = entity.asset?.name ?? '';
    dto.categoryName = entity.asset?.category?.name ?? '';
    return dto;
  }
}

export class AssetRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  formattedCreatedAt: string;

  @Expose()
  description: string;

  @Expose()
  assets: AssetResponseDto[];

  @Expose()
  createdBy: string;

  @Expose()
  userId: string;

  @Expose()
  updatedAt: Date;

  static fromEntity(entity: AssetRequestEntity): AssetRequestResponseDto {
    const dto = new AssetRequestResponseDto();
    dto.id = entity.id;
    dto.status = entity.status;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.user?.name ?? '';
    dto.userId = entity.user?.id ?? '';
    dto.formattedCreatedAt = format(new Date(entity.createdAt), 'dd/MM/yyyy');

    if (entity.items && entity.items.length > 0) {
      dto.assets = entity.items.map((item) =>
        AssetResponseDto.fromAsset(item.asset),
      );
    }

    return dto;
  }
}
