// contracts/dto/update-contract.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetRequestItemDto } from './create-asset-request-item.dto';

export class UpdateAssetRequestItemDto extends PartialType(
  CreateAssetRequestItemDto,
) {}
