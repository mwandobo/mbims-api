import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequestedAssetsService } from '../services/requested-assets.service';
import { CreateAssetRequestItemDto } from '../dtos/create-asset-request-item.dto';
import { Pagination } from '../../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../../common/dtos/pagination.dto';
import { UpdateAssetRequestItemDto } from '../dtos/update-asset-request-item.dto';

@Controller('requested-assets')
export class RequestedAssetsController {
  constructor(private readonly service: RequestedAssetsService) {}

  // @Post()
  // create(@Body() dto: CreateAssetRequestItemDto) {
  //   return this.service.create(dto);
  // }

  @Post()
  async createRequestedAssets(
    @Body() dto: CreateAssetRequestItemDto,
    @Query('requestId') requestId?: string, // query param
  ) {
    return this.service.create(dto, requestId); // returns AssetRequestItemEntity[]
  }

  // @Get()
  // findAll(@Pagination() pagination: PaginationDto) {
  //   return this.service.findAll(pagination);
  // }

  @Get()
  findAll(
    @Pagination() pagination: PaginationDto,
    @Query('requestId') requestId?: string, // query param
  ) {
    return this.service.findAll(pagination, requestId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() dto: UpdateAssetRequestItemDto) {
  //   return this.service.update(id, dto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
