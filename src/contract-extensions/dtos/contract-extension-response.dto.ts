// contractExtensions/dto/contractExtension-response.dto.ts
import { Expose } from 'class-transformer';
import { ContractExtension } from '../entities/contract-extension.entity';

export class ContractExtensionResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  amount: string;

  @Expose()
  extendedDate: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  fileUrl: string;

  @Expose()
  contractId: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromContractExtension(
    contractExtension: ContractExtension,
  ): ContractExtensionResponseDto {
    const dto = new ContractExtensionResponseDto();
    dto.id = contractExtension.id;
    dto.title = contractExtension.title;
    dto.description = contractExtension.description;
    dto.status = contractExtension.status;
    dto.contractId = contractExtension?.contract?.id;
    dto.amount = contractExtension.amount;
    dto.extendedDate = contractExtension.extendedDate;
    const baseUrl = process.env.baseUrl ?? 'http://localhost:8001'; // Your production base URL
    dto.fileUrl = contractExtension.fileUrl
      ? `${baseUrl}${contractExtension.fileUrl}`
      : '';
    return dto;
  }
}
