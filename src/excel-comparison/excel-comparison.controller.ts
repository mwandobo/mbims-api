import {
  Controller,
  Get,
} from '@nestjs/common';
import { ExcelComparisonService } from './excel-comparison.service';
import { ApiTags } from '@nestjs/swagger';
import { Pagination } from '../common/decorators/pagination.decorator';
import { PaginationDto } from '../common/dtos/pagination.dto';

@ApiTags('contracts')
@Controller('contracts')
export class ExcelComparisonController {
  constructor(
    private readonly service: ExcelComparisonService,
  ) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }
}
