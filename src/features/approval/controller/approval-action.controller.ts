import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApprovalActionService } from '../service/approval-action.service';
import { CreateApprovalActionDto } from '../dto/create-approval-action.dto';
import { UpdateApprovalActionDto } from '../dto/update-approval-action.dto';
import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ApprovalAction } from '../entities/approval-action.entity';

@ApiTags('approval-actions')
@Controller('approval-actions')
export class ApprovalActionController {
  constructor(private readonly approvalActionService: ApprovalActionService) {}

  /**
   * Get all approval actions (paginated + optional search)
   */
  @Get()
  async findAll(
    @Pagination() pagination: PaginationDto,
    @Query('approvalLevelId') approvalLevelId?: string,
  ) {
    return this.approvalActionService.findAll(pagination, approvalLevelId);
  }

  /**
   * Create a new approval action
   */
  @Post()
  async create(
    @Body() createDto: CreateApprovalActionDto,
    @Req() req: any
  ): Promise<ApprovalAction> {
    const user = req.user; // the authenticated user extracted from the JWT
    return this.approvalActionService.create(createDto, user);
  }

  /**
   * Update an approval action by ID
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateApprovalActionDto,
    @Query('currentUserId') currentUserId: string,
  ): Promise<ApprovalAction> {
    return this.approvalActionService.update(id, updateDto, currentUserId);
  }

  /**
   * Delete an approval action by ID
   */
  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('soft') soft?: boolean,
  ): Promise<void> {
    return this.approvalActionService.delete(id, soft);
  }
}
