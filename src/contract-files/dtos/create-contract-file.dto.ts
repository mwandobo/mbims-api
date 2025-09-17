// contracts/dto/create-excel-comparison.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateContractFileDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  fileUrl?: string; // You will set this after uploading

}
