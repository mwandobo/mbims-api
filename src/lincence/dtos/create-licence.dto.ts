// contracts/dto/create-excel-comparison.dto.ts
import {
  IsString,
  IsDateString,
  IsOptional,
  IsIn,
  IsUUID,
} from 'class-validator';

export class CreateLicenceDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  typeOfBusiness: string;

  @IsString()
  licenceNumber: string;

  @IsString()
  operatorName: string;

  @IsDateString()
  issuanceDate: string;

  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string; // You will set this after uploading

  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'closed'])
  status?: 'pending' | 'active' | 'completed' | 'closed';

  // @IsNumber()
  // value: number;

  // @IsDateString()
  // startDate: string;
  //
  // @IsDateString()
  // endDate: string;

  // @IsOptional()
  // @IsUUID()
  // supplier_id?: string;
}