// asset-request/dto/create-asset-request.dto.ts
import { IsString } from 'class-validator';

export class CreateAssetRequestDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  // @IsArray()
  // @IsUUID("4", { each: true }) // validate each ID is UUID v4
  // asset_ids: string[];
}
