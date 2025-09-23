// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { PositionEntity } from '../entities/position.entity';

export class PositionResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  department_name: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromPosition(position: PositionEntity): PositionResponseDto {
    const dto = new PositionResponseDto();
    dto.id = position.id;
    dto.name = position.name;
    dto.department_name = position.department?.name ?? '';
    dto.description = position.description;
    return dto;
  }
}
