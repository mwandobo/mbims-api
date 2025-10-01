// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { AssetCategoryEntity } from '../asset-category.entity';

export class AssetCategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromAssetCategory(
    assetCategory: AssetCategoryEntity,
  ): AssetCategoryResponseDto {
    const dto = new AssetCategoryResponseDto();
    dto.id = assetCategory.id;
    dto.name = assetCategory.name;
    dto.description = assetCategory.description;
    return dto;
  }
}
