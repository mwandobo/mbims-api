import { Expose } from 'class-transformer';
import { Client } from '../entities/client.entity';

export class ClientResponseDto {
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

  static fromClient(client: Client): ClientResponseDto {
    const dto = new ClientResponseDto();
    dto.id = client.id;
    dto.name = client.name;
    dto.phone = client.phone;
    dto.email = client.email;
    dto.dateOfBirth = client.dateOfBirth;
    dto.isActive = client.isActive;
    return dto;
  }
}
