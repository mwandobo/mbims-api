import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { ExcelComparisonService } from './excel-comparison.service';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Pagination } from '../common/decorators/pagination.decorator';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('contracts')
@Controller('compare-excel')
export class ExcelComparisonController {
  constructor(private readonly service: ExcelComparisonService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 2)) // Expect 2 files in "files"
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async compareExcel(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.compareExcel( files);
  }
}
