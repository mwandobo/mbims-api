import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateExcelComparisonDto } from './dtos/create-excel-comparison.dto';
import { BaseService } from '../common/services/base-service';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../common/dtos/pagination.dto';
import { ContractResponseDto } from './dtos/contract-response.dto';
import { Party } from '../party/entities/party.entity';
import { ExcelComparisonEntity } from './entities/excel-comparison.entity';

@Injectable()
export class ExcelComparisonService extends BaseService<ExcelComparisonEntity> {
  private readonly UPLOAD_PATH = 'uploads/contracts';

  constructor(
    @InjectRepository(ExcelComparisonEntity)
    private readonly excelComparisonRepository: Repository<ExcelComparisonEntity>,
  ) {
    super(excelComparisonRepository);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ContractResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['party', 'department'], // relations

      {
        fields: ['title', 'group'], // fields in contracts table
        relations: {
          department: ['name'], // search supplier.name and supplier.email
          party: ['name', 'email'], // search client.name and client.email
        },
      },
    );

    return {
      ...response,
      data: response.data.map((contract) =>
        ContractResponseDto.fromContract(contract),
      ),
    };
  }

  async compareExcel(
    createContractDto: CreateExcelComparisonDto,
    file?: Express.Multer.File,
  ): Promise<any> {



  }





}
