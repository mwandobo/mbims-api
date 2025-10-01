import { ContractExtensionService } from './contract-extension.service';
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
import { CreateContractExtensionDto } from './dtos/create-contract-extension.dto';
import { ContractExtensionResponseDto } from './dtos/contract-extension-response.dto';
import { UpdateContractExtensionDto } from './dtos/update-contract-extension.dto';

@ApiTags('contract-extensions')
@Controller('contracts/:contractId/extensions')
export class ContractExtensionController {
  constructor(
    private readonly contractExtensionService: ContractExtensionService,
  ) {}

  // Get all sub-contracts for a specific contract
  @Get()
  async findAll(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Pagination() pagination: PaginationDto,
  ) {
    return this.contractExtensionService.findAll(contractId, pagination);
  }

  // Create sub-contract for specific contract
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Body() createContractDto: CreateContractExtensionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.contractExtensionService.createContractExtension(
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
  ): Promise<ContractExtensionResponseDto> {
    return this.contractExtensionService.findOneContractExtension(id);
  }

  // Update sub-contract without contractId
  @Patch(':id')
  updateContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubContractDto: UpdateContractExtensionDto,
  ) {
    return this.contractExtensionService.updateContractExtension(
      id,
      updateSubContractDto,
    );
  }

  // Delete sub-contract without contractId
  @Delete(':id')
  deleteContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string) {
    return this.contractExtensionService.deleteContractExtension(id);
  }
}
