// contracts/dto/create-excel-comparison.dto.ts
import {
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'closed'])
  status?: 'pending' | 'active' | 'completed' | 'closed';
}