// src/activity/activity.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ActivityService } from './activity-logs.service';
import { Pagination } from '../decorators/pagination.decorator';
import { PaginationDto } from '../dtos/pagination.dto';

@Controller('activity-logs')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}
  //
  // @Get()
  // async getAllLogs() {
  //   return this.activityService.findAll();
  // }

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.activityService.findAll(pagination);
  }
}
