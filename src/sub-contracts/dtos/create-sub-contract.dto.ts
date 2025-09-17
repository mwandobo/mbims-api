// contracts/dto/create-excel-comparison.dto.ts
import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateSubContractDto {
  @IsString()
  title: string;

  @IsString()
  amount: string;

  @IsString()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  fileUrl?: string; // You will set this after uploading

  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'closed'])
  status?: 'pending' | 'active' | 'completed' | 'closed';
}
