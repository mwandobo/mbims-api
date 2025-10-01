import { ContractFileService } from './contract-file.service';
import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateContractFileDto } from './dtos/create-contract-file.dto';
import { ContractFileResponseDto } from './dtos/contract-file-response.dto';
import { UpdateContractFileDto } from './dtos/update-contract-file.dto';

@ApiTags('contract-files')
@Controller('contracts/:contractId/files')
export class ContractFileController {
  constructor(private readonly contractFileService: ContractFileService) {}

  // Get all sub-contracts for a specific contract
  @Get('')
  async findAll(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Pagination() pagination: PaginationDto,
  ) {
    return this.contractFileService.findAll(contractId, pagination);
  }

  // Create sub-contract for specific contract
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  createContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Body() createContractDto: CreateContractFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.contractFileService.createContractFile(
      contractId,
      createContractDto,
      file,
    );
  }

  // Get single sub-contract without contractId
  @Get(':id')
  findOne(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContractFileResponseDto> {
    return this.contractFileService.findOneContractFile(id);
  }

  // Update sub-contract without contractId
  @Patch(':id')
  updateContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubContractDto: UpdateContractFileDto,
  ) {
    return this.contractFileService.updateContractFile(
      id,
      updateSubContractDto,
    );
  }

  // Delete sub-contract without contractId
  @Delete(':id')
  deleteContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string) {
    return this.contractFileService.deleteContractFile(id);
  }
}
