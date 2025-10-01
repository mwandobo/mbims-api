// assets/asset-request.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { UpdateAssetDto } from './dtos/update-asset.dto';
import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

@Controller('assets')
export class AssetController {
  constructor(private readonly service: AssetService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Post()
  create(@Body() createDto: CreateAssetDto) {
    console.log('createDto', createDto);
    return this.service.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAssetDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
