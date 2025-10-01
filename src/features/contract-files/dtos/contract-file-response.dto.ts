// contractFiles/dto/contractFile-response.dto.ts
import { Expose } from 'class-transformer';
import { ContractFile } from '../entities/contract-files.entity';

export class ContractFileResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  contractId: string;

  @Expose()
  fileUrl: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromContractFile(contractFile: ContractFile): ContractFileResponseDto {
    const dto = new ContractFileResponseDto();
    dto.id = contractFile.id;
    dto.title = contractFile.title;
    dto.description = contractFile.description;
    dto.status = contractFile.status;
    dto.contractId = contractFile?.contract?.id;

    const baseUrl = process.env.baseUrl ?? 'http://localhost:8001'; // Your production base URL
    dto.fileUrl = contractFile.fileUrl
      ? `${baseUrl}${contractFile.fileUrl}`
      : '';
    return dto;
  }
}
