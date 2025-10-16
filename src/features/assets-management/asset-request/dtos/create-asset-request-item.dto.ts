// asset-request/dto/create-asset-request.dto.ts
import { IsUUID } from 'class-validator';

export class CreateAssetRequestItemDto {
  @IsUUID()
  category_id: string;

  @IsUUID()
  asset_id: string; // array of asset IDs

  // @IsUUID()
  // requestId: string;
}
