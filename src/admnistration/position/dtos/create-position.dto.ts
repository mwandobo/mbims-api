// contracts/dto/create-excel-comparison.dto.ts
import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'closed'])
  status?: 'pending' | 'active' | 'completed' | 'closed';
}