import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LicencesService } from './licences.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateLicenceDto } from './dtos/create-licence.dto';
import { UpdateLicenceDto } from './dtos/update-licence.dto';
import { LicenceResponseDto } from './dtos/licence-response.dto';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('licences')
@Controller('licences')
export class LicencesController {
  constructor(private readonly licencesService: LicencesService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.licencesService.findAll(pagination);
  }


  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<LicenceResponseDto> {
    return this.licencesService.findOneLicence(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Handle file
  createLicence(
    @Body() createLicenceDto: CreateLicenceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.licencesService.createLicence(createLicenceDto, file);
  }

  @Patch(':id')
  updateLicence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLicenceDto: UpdateLicenceDto,
  ) {
    return this.licencesService.updateLicence(id, updateLicenceDto);
  }

  @Delete(':id')
  deleteLicence(@Param('id', ParseUUIDPipe) id: string) {
    return this.licencesService.deleteLicence(id);
  }
}
