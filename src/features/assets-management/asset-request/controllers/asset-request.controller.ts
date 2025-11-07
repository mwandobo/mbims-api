// asset-request/asset-request.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AssetRequestService } from '../services/asset-request.service';
import { CreateAssetRequestDto } from '../dtos/create-asset-request.dto';
import { Pagination } from '../../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../../common/dtos/pagination.dto';
import { UpdateAssetRequestDto } from '../dtos/update-asset-request.dto';

@Controller('asset-requests')
export class AssetRequestController {
  constructor(private readonly service: AssetRequestService) {}

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Post()
  create(
    @Body() createDto: CreateAssetRequestDto,
    @Req() req: any
  ) {
    const user = req.user; // the authenticated user extracted from the JWT
    return this.service.create(createDto, user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const user = req.user; // the authenticated user extracted from the JWT
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAssetRequestDto,
    @Req() req: any
  ) {
    const user = req.user; // the authenticated user extracted from the JWT
    return this.service.update(id, updateDto, user);
  }

  @Get(':id/submit')
  submit(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const user = req.user; // the authenticated user extracted from the JWT
    return this.service.submit(id, user);
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
