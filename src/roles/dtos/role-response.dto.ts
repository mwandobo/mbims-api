// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { Role } from '../entities/role.entity';

export class RoleResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromRole(role: Role): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.id = role.id;
    dto.name = role.name;
    return dto;
  }
}
