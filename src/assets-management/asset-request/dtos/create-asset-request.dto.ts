// asset-request/dto/create-asset-request.dto.ts
import { IsUUID, IsInt, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class CreateAssetRequestItemDto {
  @IsUUID()
  asset_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateAssetRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetRequestItemDto)
  items: CreateAssetRequestItemDto[];
}
