import { Expose } from 'class-transformer';
import { Permission } from '../entities/permission.entity';

export class PermissionResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  group: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromPermission(permission: Permission): PermissionResponseDto {
    const dto = new PermissionResponseDto();
    dto.id = permission.id;
    dto.name = permission.name;
    dto.group = permission.group;
    return dto;
  }
}
