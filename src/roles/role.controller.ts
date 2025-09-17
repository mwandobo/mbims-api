// roles/role.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dtos/role.dto';
import { Pagination } from '../common/decorators/pagination.decorator';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Get()
  async findAll(@Pagination() pagination: PaginationDto) {
    return this.roleService.findAll(pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roleService.findRoleById(id);
  }

  @Post('assign/:id')
  async assignPermissions(
    @Param('id') id: string,
    @Body() body: { permissions: number[] },
  ) {

    console.log(body);
    return this.roleService.assignPermissions(id, body.permissions);
  }

  @Get('permissions/:id')
  async getRolePermissions(@Param('id') id: string) {
    return this.roleService.getRoleWithPermissions(id);
  }
}