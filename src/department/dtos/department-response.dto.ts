// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { Department } from '../entities/department.entity';

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

  static fromDepartment(department: Department): DepartmentResponseDto {
    const dto = new DepartmentResponseDto();
    dto.id = department.id;
    dto.name = department.name;
    dto.description = department.description;
    return dto;
  }
}
