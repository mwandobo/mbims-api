import { PartialType } from '@nestjs/mapped-types';
import { CreateApprovalActionDto } from './create-approval-action.dto';

export class UpdateApprovalActionDto extends PartialType(
  CreateApprovalActionDto,
) {}
