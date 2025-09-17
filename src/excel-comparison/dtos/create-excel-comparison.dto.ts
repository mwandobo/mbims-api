// contracts/dto/create-excel-comparison.dto.ts
import {
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateExcelComparisonDto {
  @IsOptional()
  @IsString()
  firstExcel?: string;

  @IsOptional()
  @IsString()
  secondExcel?: string; // You will set this after uploading
}