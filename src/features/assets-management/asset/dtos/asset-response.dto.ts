// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { AssetEntity } from '../asset.entity';

export class AssetResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  categoryName: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromAsset(
    asset: AssetEntity,
  ): AssetResponseDto {
    const dto = new AssetResponseDto();
    dto.id = asset.id;
    dto.name = asset.name;
    dto.description = asset.description;
    dto.categoryName = asset.category?.name ?? '';
    return dto;
  }
}
