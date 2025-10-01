// asset-request/asset-request.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AssetRequestService } from '../services/asset-request.service';
import { CreateAssetRequestDto } from '../dtos/create-asset-request.dto';
import { UpdateAssetRequestDto } from '../dtos/update-asset-request.dto';
import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

@Controller('asset-requests')
export class AssetRequestController {
  constructor(private readonly service: AssetRequestService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Post()
  create(@Body() createDto: CreateAssetRequestDto) {
    return this.service.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    // @Body() updateDto: UpdateAssetRequestDto,
  ) {
    return this.service.update(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/assets')
  async findAssetsByRequestId(
    @Param('id') id: string,
    @Pagination() pagination: PaginationDto,
  ) {
    return this.service.findAssetsByRequestId(id, pagination);
  }

  // ✅ Get a single item in a request by itemId
  @Get(':requestId/assets/:itemId')
  async findAssetItemById(
    @Param('requestId') requestId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.findAssetItemById(requestId, itemId);
  }

  @Get('assets/:itemId')
  async findAssetItemByv1Id(
    @Param('itemId') itemId: string,
  ) {
    return this.service.findAssetItemByIdv1(itemId);
  }

}
