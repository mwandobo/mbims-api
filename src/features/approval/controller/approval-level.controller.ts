import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateApprovalLevelDto } from '../dto/create-approval-level.dto';
import { UpdateApprovalLevelDto } from '../dto/update-approval-level.dto';
import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ApprovalLevel } from '../entities/approval-level.entity';
import { ApprovalLevelService } from '../service/approval-level.service';

@ApiTags('approval-levels')
@Controller('approval-levels')
export class ApprovalLevelController {
  constructor(
    private readonly approvalLevelService: ApprovalLevelService,
  ) {}

  /**
   * Get all approval levels (paginated + optional search)
   */
  @Get()
  async findAll(
    @Pagination() pagination: PaginationDto,
    @Query('userApprovalId') userApprovalId?: string,
  ) {
    return this.approvalLevelService.findAll(pagination, userApprovalId);
  }

  /**
   * Create an approval level
   */
  @Post()
  async create(
    @Body() createApprovalLevelDto: CreateApprovalLevelDto,
    @Query('userApprovalId') UserApprovalId: string,
    @Req() req: any
  ): Promise<ApprovalLevel> {
    const user = req.user;
    return this.approvalLevelService.createApprovalLevel(
      createApprovalLevelDto,
      UserApprovalId,
      user
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.approvalLevelService.findOne(id);
  }


  /**
   * Update approval level by ID
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateApprovalLevelDto: UpdateApprovalLevelDto,
  ): Promise<ApprovalLevel> {
    return this.approvalLevelService.updateApprovalLevel(
      id,
      updateApprovalLevelDto,
    );
  }

  /**
   * Delete approval level by ID
   */
  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('soft') soft?: boolean,
  ): Promise<void> {
    return this.approvalLevelService.deleteApprovalLevel(id, soft);
  }
}
