// asset-request/dto/create-asset-request.dto.ts
import { IsUUID, IsString, ArrayNotEmpty, IsArray } from 'class-validator';

export class CreateAssetRequestItemDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("all", { each: true })
  asset_ids: string[]; // array of asset IDs

  // @IsUUID()
  // requestId: string;
}
