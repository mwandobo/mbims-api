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
import { PolicyService } from './policy.service';
import { ApiTags } from '@nestjs/swagger';
import { CreatePolicyDto } from './dtos/create-policy.dto';
import { UpdatePolicyDto } from './dtos/update-policy.dto';
import { PolicyResponseDto } from './dtos/policy-response.dto';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('policies')
@Controller('policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.policyService.findAll(pagination);
  }


  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PolicyResponseDto> {
    return this.policyService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Handle file
  createLicence(
    @Body() createLicenceDto: CreatePolicyDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.policyService.create(createLicenceDto, file);
  }

  @Patch(':id')
  updateLicence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLicenceDto: UpdatePolicyDto,
  ) {
    return this.policyService.update(id, updateLicenceDto);
  }

  @Delete(':id')
  deleteLicence(@Param('id', ParseUUIDPipe) id: string) {
    return this.policyService.delete(id);
  }
}
