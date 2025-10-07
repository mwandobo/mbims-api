// src/features/approval/dtos/update-user-approval.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserApprovalDto } from './create-user-approval.dto';

export class UpdateUserApprovalDto extends PartialType(CreateUserApprovalDto) {}
