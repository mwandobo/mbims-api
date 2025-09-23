// roles/role-permission.controller.ts
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { CreatePermissionDto } from './dtos/permission.dto';
import { PermissionService } from './permission.service';


@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}


  @Get()
  getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @Post()
  async addPermission(
    @Param('roleId') roleId: string,
    @Body() createPermissionDto: CreatePermissionDto
  ) {
    return this.permissionService.addPermissionToRole(
      roleId,
      createPermissionDto,
    );
  }

  @Get()
  async getPermissions(@Param('roleId') roleId: string) {
    return this.permissionService.getRolePermissions(roleId);
  }
}