// contracts/dto/update-contract.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetRequestDto } from './create-asset-request.dto';

export class UpdateAssetRequestDto extends PartialType(
  CreateAssetRequestDto,
) {}
