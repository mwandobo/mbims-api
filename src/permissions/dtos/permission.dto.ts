// permissions/dto/create-permission.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string; // e.g., 'create', 'read', 'update', 'delete'

  @IsString()
  @IsNotEmpty()
  group: string; // e.g., 'user', 'post', 'product'

  @IsOptional()
  @IsNotEmpty()
  description: string;
}