// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { ApprovalAction } from '../entities/approval-action.entity';
import { format } from 'date-fns';

export class ApprovalActionResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  remark: string;

  @Expose()
  type: string;

  @Expose()
  approvedBy: string;

  @Expose()
  approvalLevelName: string;

  @Expose()
  formattedCreatedAt: string;

  @Expose()
  action: string;

  @Expose()
  updatedAt: Date;

  static fromEntity(
    entity: ApprovalAction,
  ): ApprovalActionResponseDto {
    const dto = new ApprovalActionResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.remark = entity.description;
    dto.action = entity.action;
    dto.approvedBy = entity.user?.name;
    dto.type = entity.type;
    dto.approvalLevelName = entity.approvalLevel?.name;
    dto.formattedCreatedAt = format(
      new Date(entity.createdAt),
      'dd/MM/yyyy',
    );
    return dto;
  }
}
