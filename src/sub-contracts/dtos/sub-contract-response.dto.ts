// subContracts/dto/subContract-response.dto.ts
import { Expose } from 'class-transformer';
import { SubContract } from '../entities/sub-contracts.entity';

export class SubContractResponseDto {
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
  departmentId: string;

  @Expose()
  contractId: string;

  // Computed fields
  @Expose()
  departmentName: string;

  @Expose()
  group: string;

  @Expose()
  supplierId: string;

  // Computed fields
  @Expose()
  supplierName: string;

  @Expose()
  reference_no: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromSubContract(subContract: SubContract): SubContractResponseDto {
    const dto = new SubContractResponseDto();
    dto.id = subContract.id;
    dto.title = subContract.title;
    dto.description = subContract.description;
    dto.startDate = subContract.startDate;
    dto.endDate = subContract.endDate;
    dto.reference_no = subContract.reference_no;
    dto.contractId = subContract?.contract?.id;
    dto.amount = subContract?.amount;
    dto.status = subContract.status;
    const baseUrl = 'http://localhost:8001'; // Your production base URL
    dto.fileUrl = subContract.fileUrl ? `${baseUrl}${subContract.fileUrl}` : '';
    return dto;
  }
}
