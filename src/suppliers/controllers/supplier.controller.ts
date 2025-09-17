import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from '../services/suppliers.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { CreateSupplierDto } from '../dtos/create-supplier.dto';
import { UpdateSupplierDto } from '../dtos/update-supplier.dto';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly supplierService: SuppliersService) {}

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.supplierService.findAll(pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}