// src/activity/activity.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity.entity';
import { PaginatedResponseDto, PaginationDto } from '../dtos/pagination.dto';
import { BaseService } from '../services/base-service';
import { ActivityLogDto } from './activity-log.dto';

@Injectable()
// export class ActivityService {

  export class ActivityService extends BaseService<ActivityLog> {

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
  ) {
    super(activityRepo)
  }

  async create(log: Partial<ActivityLog>): Promise<ActivityLog> {
    const newLog = this.activityRepo.create(log);
    return this.activityRepo.save(newLog);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ActivityLogDto>> {
    const response = await this.findAllPaginated(
      pagination,
      [], // relations to load
      {
        fields: ['activity', 'user'], // searchable fields
      },
    );

    return {
      ...response,
      data: response.data.map((n) =>
        ActivityLogDto.fromActivityLog(n),
      ),
    };
  }
}
