// In your controller
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AssetCategoryService } from './asset-category.service';
import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { CreateAssetCategoryDto } from './dtos/create-asset-category.dto';
import { UpdateAssetCategoryDto } from './dtos/update-asset-category.dto';

@Controller('asset-categories')
export class AssetCategoryController {
  constructor(private readonly service: AssetCategoryService) {}

  @Post()
  create(@Body() createDto: CreateAssetCategoryDto) {
    return this.service.create(createDto);
  }

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAssetCategoryDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
