// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { format } from 'date-fns';
import { ApprovalLevel } from '../entities/approval-level.entity';

export class ApprovalLevelResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  roleName: string;

  @Expose()
  userApprovalName: string;

  @Expose()
  level: number;

  @Expose()
  formattedLevel: string;

  @Expose()
  formattedCreatedAt: string;

  static fromEntity(
    entity: ApprovalLevel,
  ): ApprovalLevelResponseDto {
    const dto = new ApprovalLevelResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.roleName = entity.role.name;
    dto.userApprovalName = entity.userApproval.name;
    dto.level = entity.level;
    dto.formattedLevel = `Level_${entity.level}`;
    dto.formattedCreatedAt = format(
      new Date(entity.createdAt),
      'dd/MM/yyyy',
    );
    return dto;
  }
}
