// asset-request/dto/create-asset-request.dto.ts
import {
  IsUUID,
  IsInt,
  Min,
  ValidateNested,
  IsArray,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateAssetRequestItemDto {
  @IsUUID()
  asset_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateAssetRequestDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssetRequestItemDto)
  items: CreateAssetRequestItemDto[];
}
