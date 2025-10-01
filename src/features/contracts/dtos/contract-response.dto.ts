// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { Contract } from '../entities/contracts.entity';

export class ContractResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  amount: string;

  @Expose()
  description: string;

  @Expose()
  startDate: string;

  @Expose()
  endDate: string;

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
  group: string;

  @Expose()
  reference_no: string;

  @Expose()
  supplier_id: string;
  // Computed fields
  @Expose()
  supplierName: string;

  @Expose()
  party_id: string;

  @Expose()
  partyName: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  farthestExtendedDate?: string;
  totalExtensionAmount: number;

  static fromContract(
    contract: Contract,
    extensionData?: {
      farthestExtendedDate?: string;
      totalExtensionAmount: number;
    },
  ): ContractResponseDto {
    const dto = new ContractResponseDto();
    dto.id = contract.id;
    dto.title = contract.title;
    dto.description = contract.description;
    dto.startDate = contract.startDate;
    dto.endDate = contract.endDate;
    dto.status = contract.status;
    dto.amount = contract.amount;
    dto.reference_no = contract.reference_no;
    dto.group = contract.group;
    dto.department_id = (contract.department as any)?.id || '';
    dto.departmentName = contract.department?.name || '';
    dto.party_id = (contract.party as any)?.id || '';
    dto.partyName = contract.party?.name || '';
    dto.supplier_id = (contract.supplier as any)?.id || '';
    dto.farthestExtendedDate = extensionData?.farthestExtendedDate;
    dto.totalExtensionAmount = extensionData?.totalExtensionAmount || 0;
    dto.supplierName =
      contract.group === 'supplier'
        ? contract.supplier?.name
        : contract.client?.name;
    // Assuming contract.file contains the relative path like '/uploads/contracts/filename.jpg'
    const baseUrl = process.env.baseUrl ?? 'http://localhost:8001'; // Your production base URL
    dto.fileUrl = contract.fileUrl ? `${baseUrl}${contract.fileUrl}` : '';
    return dto;
  }
}
