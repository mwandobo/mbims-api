// src/features/approval/controllers/user-approval.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { UserApprovalService } from '../service/user-approval.service';
import { CreateUserApprovalDto } from '../dto/create-user-approval.dto';
import { UpdateUserApprovalDto } from '../dto/update-user-approval.dto';

@ApiTags('user-approvals')
@Controller('user-approvals')
export class UserApprovalController {
  constructor(
    private readonly userApprovalService: UserApprovalService,
  ) {}

  /**
   * 🔹 Get all user approvals (paginated)
   */
  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.userApprovalService.findAll(pagination);
  }

  /**
   * 🔹 Get a single user approval by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userApprovalService.findOne(id);
  }

  /**
   * 🔹 Create a new user approval
   */
  @Post()
  async create(@Body() createUserApprovalDto: CreateUserApprovalDto) {
    return this.userApprovalService.createUserApproval(createUserApprovalDto);
  }

  /**
   * 🔹 Update an existing user approval
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserApprovalDto: UpdateUserApprovalDto,
  ) {
    return this.userApprovalService.updateUserApproval(
      id,
      updateUserApprovalDto,
    );
  }

  /**
   * 🔹 Delete a user approval (soft delete by default)
   */
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userApprovalService.deleteUserApproval(id);
  }
}
