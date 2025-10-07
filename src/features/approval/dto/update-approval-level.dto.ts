import { PartialType } from '@nestjs/mapped-types';
import { CreateApprovalLevelDto } from './create-approval-level.dto';

export class UpdateApprovalLevelDto extends PartialType(
  CreateApprovalLevelDto,
) {}
