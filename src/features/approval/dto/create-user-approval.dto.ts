// src/features/approval/dtos/create-user-approval.dto.ts
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserApprovalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  sysApprovalId: string;
}
