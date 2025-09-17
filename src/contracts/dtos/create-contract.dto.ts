// contracts/dto/create-excel-comparison.dto.ts
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsIn, IsUUID,
} from 'class-validator';

export class CreateContractDto {
  @IsString()
  title: string;

  @IsString()
  amount: string;

  @IsString()
  description: string;

  @IsString()
  clientName: string;

  @IsString()
  group: 'supplier' | 'client';

  @IsNumber()
  value: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsUUID()
  party_id?: string;

  // @IsOptional()
  // @IsUUID()
  // client_id?: string;

  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string; // You will set this after uploading

  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'closed'])
  status?: 'pending' | 'active' | 'completed' | 'closed';
}