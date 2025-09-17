// licences/dto/licence-response.dto.ts
import { Expose } from 'class-transformer';
import { Licence } from '../entities/licence.entity';

export class LicenceResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  typeOfBusiness: string;

  @Expose()
  licenceNumber: string;

  @Expose()
  operatorName: string;

  @Expose()
  issuanceDate: string;

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
  supplier_id: string;

  @Expose()
  reference_no: string;

  // Computed fields
  @Expose()
  supplierName: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromLicence(licence: Licence): LicenceResponseDto {
    const dto = new LicenceResponseDto();
    dto.id = licence.id;
    dto.title = licence.title;
    dto.description = licence.description;
    dto.typeOfBusiness = licence.typeOfBusiness;
    dto.operatorName = licence.operatorName;
    dto.issuanceDate = licence.issuanceDate;
    dto.licenceNumber = licence.licenceNumber;
    dto.startDate = licence.startDate;
    dto.endDate = licence.endDate;
    dto.status = licence.status;
    dto.reference_no = licence.reference_no;
    dto.department_id = (licence.department as any)?.id || '';
    dto.departmentName = licence.department?.name || '';
    dto.supplier_id = (licence.supplier as any)?.id || '';
    dto.supplierName = licence.supplier?.name;
    const baseUrl = process.env.baseUrl ?? 'http://localhost:8001'; // Your production base URL
    dto.fileUrl = licence.fileUrl ? `${baseUrl}${licence.fileUrl}` : '';
    return dto;
  }
}
