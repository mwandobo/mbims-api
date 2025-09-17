import { SubContractsService } from './sub-contracts.service';
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
import { Pagination } from '../common/decorators/pagination.decorator';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSubContractDto } from './dtos/create-sub-contract.dto';
import { SubContractResponseDto } from './dtos/sub-contract-response.dto';
import { UpdateSubContractDto } from './dtos/update-sub-contract.dto';

@ApiTags('sub-contracts')
@Controller('contracts/:contractId/sub-contracts')
export class SubContractsController {
  constructor(private readonly subContractsService: SubContractsService) {}

  // Get all sub-contracts for a specific contract
  @Get()
  async findAll(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Pagination() pagination: PaginationDto,
  ) {
    return this.subContractsService.findAll(contractId, pagination);
  }

  // Create sub-contract for specific contract
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Body() createContractDto: CreateSubContractDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.subContractsService.createSubContract(
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
  ): Promise<SubContractResponseDto> {
    return this.subContractsService.findOneSubContract(id);
  }

  // Update sub-contract without contractId
  @Patch(':id')
  updateContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubContractDto: UpdateSubContractDto,
  ) {
    return this.subContractsService.updateSubContract(id, updateSubContractDto);
  }

  // Delete sub-contract without contractId
  @Delete(':id')
  deleteContract(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.subContractsService.deleteSubContract(id);
  }
}
