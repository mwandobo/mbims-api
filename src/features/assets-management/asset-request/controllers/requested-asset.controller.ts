import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RequestedAssetsService } from '../services/requested-assets.service';
import { CreateAssetRequestItemDto } from '../dtos/create-asset-request-item.dto';
import { Pagination } from '../../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../../common/dtos/pagination.dto';

@Controller('requested-assets')
export class RequestedAssetsController {
  private readonly logger = new Logger(RequestedAssetsService.name);

  constructor(private readonly service: RequestedAssetsService) {}

  @Get()
  findAll(
    @Pagination() pagination: PaginationDto,
    @Query('requestId') requestId?: string, // query param
  ) {
    this.logger.debug(requestId);
    return this.service.findAll(pagination, requestId);
  }

  @Post()
  async create(
    @Body() dto: CreateAssetRequestItemDto,
    @Query('requestId') requestId?: string, // query param
  ) {
    return this.service.create(dto, requestId); // returns AssetRequestItemEntity[]
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
