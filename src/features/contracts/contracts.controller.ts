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
import { ContractsService } from './contracts.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateContractDto } from './dtos/create-contract.dto';
import { UpdateContractDto } from './dtos/update-contract.dto';
import { ContractResponseDto } from './dtos/contract-response.dto';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { EmailService } from '../../common/mailer/email.service';

@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly emailSrevice: EmailService,
  ) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.contractsService.findAll(pagination);
  }

  @Get('send-email')
  sendEmail() {
    return this.emailSrevice.sendWelcomeEmail(
      'breezojr@gmail.com',
      'Boniface Mwandobo',
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContractResponseDto> {
    return this.contractsService.findOneContract(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Handle file
  createContract(
    @Body() createContractDto: CreateContractDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.contractsService.createContract(createContractDto, file);
  }

  @Patch(':id')
  updateContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.updateContract(id, updateContractDto);
  }

  @Delete(':id')
  deleteContract(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.deleteContract(id);
  }
}
