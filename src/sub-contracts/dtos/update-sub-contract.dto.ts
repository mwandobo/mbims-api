// contracts/dto/update-contract.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubContractDto } from './create-sub-contract.dto';

export class UpdateSubContractDto extends PartialType(CreateSubContractDto) {}