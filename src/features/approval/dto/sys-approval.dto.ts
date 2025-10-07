// licences/dto/licence-response.dto.ts
import { Expose } from 'class-transformer';
import { SysApproval } from '../entities/system-approval.entity';

export class SysApprovalResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  entityName: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromSysApprovals(sysApproval: SysApproval): SysApprovalResponseDto {
    const dto = new SysApprovalResponseDto();
    dto.id = sysApproval.id;
    dto.name = sysApproval.name;
    dto.description = sysApproval.description;
    dto.entityName = sysApproval.entityName;
    return dto;
  }
}
