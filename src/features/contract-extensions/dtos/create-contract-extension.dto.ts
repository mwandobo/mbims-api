// contracts/dto/create-excel-comparison.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateContractExtensionDto {
  @IsString()
  title: string;

  @IsString()
  amount: string;

  @IsString()
  extendedDate: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  fileUrl?: string; // You will set this after uploading
}
