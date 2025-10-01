// contracts/dto/update-contract.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateContractExtensionDto } from './create-contract-extension.dto';

export class UpdateContractExtensionDto extends PartialType(
  CreateContractExtensionDto,
) {}
