// licences/dto/licence-response.dto.ts
import { Expose } from 'class-transformer';
import { Policy } from 'src/policy/entities/policy.entity';

export class PolicyResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  approvalDate: string;

  @Expose()
  issuanceDate: string;

  @Expose()
  nextRenewalDate: string;

  @Expose()
  owner: string;

  @Expose()
  status: string;

  @Expose()
  fileUrl: string;

  @Expose()
  department_id: string;

  // Computed fields
  @Expose()
  departmentName: string;

  @Expose()
  reference_no: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromLicence(policy: Policy): PolicyResponseDto {
    const dto = new PolicyResponseDto();
    dto.id = policy.id;
    dto.title = policy.title;
    dto.description = policy.description;
    dto.issuanceDate = policy.issuanceDate;
    dto.approvalDate = policy.approvalDate;
    dto.nextRenewalDate = policy.nextRenewalDate;
    dto.owner = policy.owner;
    dto.status = policy.status;
    dto.reference_no = policy.reference_no;
    dto.department_id = (policy.department as any)?.id || '';
    dto.departmentName = policy.department?.name || '';
    // dto.supplier_id = (policy.supplier as any)?.id || '';
    // dto.supplierName = policy.supplier?.name;
    const baseUrl = process.env.baseUrl ?? 'http://localhost:8001'; // Your production base URL
    dto.fileUrl = policy.fileUrl ? `${baseUrl}${policy.fileUrl}` : '';
    return dto;
  }
}
