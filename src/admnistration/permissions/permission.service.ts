// roles/role-permission.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { CreatePermissionDto } from './dtos/permission.dto';
import { Permission } from './entities/permission.entity';
import { PermissionResponseDto } from './dtos/permission-response.dto';


@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async getAllPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.find({
      relations: [],
    });
    return permissions.map(PermissionResponseDto.fromPermission);
  }
  
  async addPermissionToRole(
    roleId: string,
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if permission already exists
    const existingPermission = role.permissions.find(
      (p) =>
        p.name === createPermissionDto.name &&
        p.group === createPermissionDto.group,
    );

    if (existingPermission) {
      return existingPermission;
    }

    // Create new permission
    const permission = this.permissionRepository.create({
      ...createPermissionDto,
    });

    return this.permissionRepository.save(permission);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId},
      relations: ['permissions']
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return role.permissions;
  }
}