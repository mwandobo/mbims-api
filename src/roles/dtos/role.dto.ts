import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { CreatePermissionDto } from '../../permissions/dtos/permission.dto';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  permissions?: CreatePermissionDto[]; // Array of permission DTOs
}