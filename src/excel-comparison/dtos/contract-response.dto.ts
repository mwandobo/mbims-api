// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';
import { ExcelComparisonEntity } from '../entities/excel-comparison.entity';

export class ContractResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

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

  farthestExtendedDate?: string;
  totalExtensionAmount: number;

  static fromContract(
    excel: ExcelComparisonEntity,
    extensionData?: {
      farthestExtendedDate?: string;
      totalExtensionAmount: number;
    },
  ): ContractResponseDto {
    const dto = new ContractResponseDto();
    dto.id = excel.id;
    dto.farthestExtendedDate = extensionData?.farthestExtendedDate;
    dto.totalExtensionAmount = extensionData?.totalExtensionAmount || 0;
    const baseUrl = process.env.baseUrl ?? 'http://localhost:8001'; // Your production base URL
    dto.fileUrl = excel.fileUrl ? `${baseUrl}${excel.fileUrl}` : '';
    return dto;
  }
}
