// contracts/dto/create-excel-comparison.dto.ts
import {
  IsString,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreatePartyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  fileUrl?: string; // You will set this after uploading
}