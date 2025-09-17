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
import { ClientsService } from '../services/client.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.clientsService.findAll(pagination);
  }

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}