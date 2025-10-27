import { Expose } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  isActive: boolean;

  @Expose()
  canReceiveEmail: boolean;

  @Expose()
  role_id: string;

  @Expose()
  department_id: string;

  // Computed fields
  @Expose()
  fullName: string;

  @Expose()
  departmentName: string;

  @Expose()
  positionName: string;

  @Expose()
  approvalStatus: string;

  @Expose()
  roleName: string;

  static fromUser(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.canReceiveEmail = user.canReceiveEmail;
    dto.isActive = user.isActive;
    dto.role_id = (user.role as any)?.id || ''; // in case role is an object
    dto.department_id = (user.department as any)?.id || '';
    dto.departmentName = user.department?.name || '';
    dto.positionName = user.position?.name;
    dto.roleName = user.role?.name || '';
    dto.approvalStatus = ''; // or your computed logic
    return dto;
  }
}
