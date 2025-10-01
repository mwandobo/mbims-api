// contracts/dto/create-excel-comparison.dto.ts
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsIn,
  IsUUID,
} from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  title: string;

  @IsString()
  owner: string;

  @IsString()
  approvalDate: string;

  @IsString()
  issuanceDate: string;

  @IsString()
  nextRenewalDate: string;

  @IsString()
  description: string;

  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string; // You will set this after uploading

  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'closed'])
  status?: 'pending' | 'active' | 'completed' | 'closed';
}