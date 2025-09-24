// contracts/dto/update-contract.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetDto } from './create-asset.dto';

export class UpdateAssetDto extends PartialType(
  CreateAssetDto,
) {}
