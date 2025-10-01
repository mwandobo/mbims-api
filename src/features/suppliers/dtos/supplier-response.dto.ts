import { Expose } from 'class-transformer';
import { Supplier } from '../entities/supplier.entity';

export class SupplierResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  email: string;

  @Expose()
  dateOfBirth: string;

  @Expose()
  isActive: boolean;

  // Computed fields
  @Expose()
  fullName: string;

  @Expose()
  departmentName: string;

  @Expose()
  roleName: string;

  static fromSupplier(supplier: Supplier): SupplierResponseDto {
    const dto = new SupplierResponseDto();
    dto.id = supplier.id;
    dto.name = supplier.name;
    dto.phone = supplier.phone;
    dto.email = supplier.email;
    dto.dateOfBirth = supplier.dateOfBirth;
    dto.isActive = supplier.isActive;
    return dto;
  }
}
