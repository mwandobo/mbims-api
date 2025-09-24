// contracts/dto/create-excel-comparison.dto.ts
import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsUUID()
  category_id: string;

  @IsOptional()
  @IsIn(['pending', 'active', 'completed', 'closed'])
  status?: 'pending' | 'active' | 'completed' | 'closed';
}