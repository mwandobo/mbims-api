// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { PositionEntity } from '../../position/entities/position.entity';
import { DepartmentEntity } from '../entities/department.entity';

export class DepartmentResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromDepartment(department: DepartmentEntity): DepartmentResponseDto {
    const dto = new DepartmentResponseDto();
    dto.id = department.id;
    dto.name = department.name;
    dto.description = department.description;
    return dto;
  }
}
