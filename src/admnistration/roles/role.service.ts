// roles/role.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dtos/role.dto';
import { Permission } from '../permissions/entities/permission.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { BaseService } from '../../common/services/base-service';
import { RoleResponseDto } from './dtos/role-response.dto';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(roleRepository);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['permissions'], // relations
      {
        fields: ['name'], // fields in contracts table
      },
    );

    return {
      ...response,
      data: response.data.map((role) => RoleResponseDto.fromRole(role)),
    };
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissions = [], ...roleData } = createRoleDto;

    // Create the role first
    const role = this.roleRepository.create(roleData);

    // Create and associate permissions if provided
    if (permissions.length > 0) {
      role.permissions = permissions.map((permissionDto) =>
        this.permissionRepository.create(permissionDto),
      );
    }

    return this.roleRepository.save(role);
  }

  async findRoleById(id: string): Promise<Role> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async getRoleWithPermissions(roleId: string): Promise<any> {
    // Fetch all permissions in the system
    const allPermissions = await this.permissionRepository.find();

    // Fetch the role with its assigned permissions
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return {
      roleId: role.id,
      roleName: role.name,
      rolePermissions: role.permissions,
      allPermissions,
    };
  }

  async assignPermissions(
    roleId: string,
    permissionIds: number[],
  ): Promise<Role> {
    // Fetch the role
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Fetch the selected permissions
    // Assign permissions to the role
    role.permissions = await this.permissionRepository.findByIds(permissionIds);

    // Save the updated role
    return this.roleRepository.save(role);
  }
}
