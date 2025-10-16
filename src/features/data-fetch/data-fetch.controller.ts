import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { DataFetchService } from './data-fetch.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('fetch-data')
@ApiBearerAuth()
@Controller('fetch-data')
@UseGuards(JwtAuthGuard)
export class FetchDataController {
  constructor(private readonly dataFetchService: DataFetchService) {}

  @Get('suppliers')
  async getSuppliers() {
    return this.dataFetchService.getSuppliers();
  }

  @Get('clients')
  async getClients() {
    return this.dataFetchService.getClients();
  }

  @Get('departments')
  async getDepartments() {
    return this.dataFetchService.getDepartments();
  }

  @Get('roles')
  async getRoles() {
    return this.dataFetchService.getRoles();
  }

  @Get('parties')
  async getParties() {
    return this.dataFetchService.getParties();
  }

  @Get('asset-categories')
  async getAssetCategories() {
    return this.dataFetchService.getAssetCategories();
  }

  @Get('assets-by-categories')
  async getAssetsByCategories(@Query('type') categoryId?: string) {
    return this.dataFetchService.getAssetsByCategory(categoryId);
  }
}