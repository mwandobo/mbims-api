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
import { PartyService } from './party.service';
import { ApiTags } from '@nestjs/swagger';
import { CreatePartyDto } from './dtos/create-party.dto';
import { UpdatePartyDto } from './dtos/update-party.dto';
import { PartyResponseDto } from './dtos/party-response.dto';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('parties')
@Controller('parties')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.partyService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PartyResponseDto> {
    return this.partyService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Handle file
  createLicence(
    @Body() createLicenceDto: CreatePartyDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.partyService.create(createLicenceDto, file);
  }

  @Patch(':id')
  updateLicence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLicenceDto: UpdatePartyDto,
  ) {
    return this.partyService.update(id, updateLicenceDto);
  }

  @Delete(':id')
  deleteLicence(@Param('id', ParseUUIDPipe) id: string) {
    return this.partyService.delete(id);
  }
}
