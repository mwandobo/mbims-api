// admin-user.seeder.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../features/users/entities/user.entity';
import { Role } from '../../admnistration/roles/entities/role.entity';
import { Permission } from '../../admnistration/permissions/entities/permission.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminUserSeederService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedPermissions(): Promise<Permission[]> {
    const permissionGroups = [
      {
        group: 'user',
        permissions: [
          { name: 'user_create', description: 'Create users' },
          { name: 'user_read', description: 'View users' },
          { name: 'user_update', description: 'Edit users' },
          { name: 'user_delete', description: 'Delete users' },
        ],
      },
      {
        group: 'department',
        permissions: [
          { name: 'department_create', description: 'Create departments' },
          { name: 'department_read', description: 'View departments' },
          { name: 'department_update', description: 'Edit departments' },
          { name: 'department_delete', description: 'Delete departments' },
        ],
      },
      {
        group: 'position',
        permissions: [
          { name: 'position_create', description: 'Create positions' },
          { name: 'position_read', description: 'View positions' },
          { name: 'position_update', description: 'Edit positions' },
          { name: 'position_delete', description: 'Delete positions' },
        ],
      },
      {
        group: 'contract',
        permissions: [
          { name: 'contract_create', description: 'Create contracts' },
          { name: 'contract_read', description: 'View contracts' },
          { name: 'contract_update', description: 'Edit contracts' },
          { name: 'contract_delete', description: 'Delete contracts' },
        ],
      },
      {
        group: 'sub_contract',
        permissions: [
          { name: 'sub_contract_create', description: 'Create sub contracts' },
          { name: 'sub_contract_read', description: 'View sub contracts' },
          { name: 'sub_contract_update', description: 'Edit sub contracts' },
          { name: 'sub_contract_delete', description: 'Delete sub contracts' },
        ],
      },
      {
        group: 'contract_file',
        permissions: [
          {
            name: 'contract_file_create',
            description: 'Create contract_files',
          },
          { name: 'contract_file_read', description: 'View contract_files' },
          {
            name: 'contract_file_update',
            description: 'Edit contract files',
          },
          {
            name: 'contract_file_delete',
            description: 'Delete contract files',
          },
        ],
      },
      {
        group: 'contract_extension',
        permissions: [
          {
            name: 'contract_extension_create',
            description: 'Create contract_extensions',
          },
          {
            name: 'contract_extension_read',
            description: 'View contract_extensions',
          },
          {
            name: 'contract_extension_update',
            description: 'Edit contract_extensions',
          },
          {
            name: 'contract_extension_delete',
            description: 'Delete contract_extensions',
          },
        ],
      },
      {
        group: 'licence',
        permissions: [
          { name: 'licence_create', description: 'Create licences' },
          { name: 'licence_read', description: 'View licences' },
          { name: 'licence_update', description: 'Edit licences' },
          { name: 'licence_delete', description: 'Delete licences' },
        ],
      },
      {
        group: 'policy',
        permissions: [
          { name: 'policy_create', description: 'Create policies' },
          { name: 'policy_read', description: 'View policies' },
          { name: 'policy_update', description: 'Edit policies' },
          { name: 'policy_delete', description: 'Delete policies' },
        ],
      },
      {
        group: 'employee',
        permissions: [
          { name: 'employee_create', description: 'Create employees' },
          { name: 'employee_read', description: 'View employees' },
          { name: 'employee_update', description: 'Edit employees' },
          { name: 'employee_delete', description: 'Delete employees' },
        ],
      },
      {
        group: 'role',
        permissions: [
          { name: 'role_create', description: 'Create roles' },
          { name: 'role_read', description: 'View roles' },
          { name: 'role_update', description: 'Edit roles' },
          { name: 'role_delete', description: 'Delete roles' },
          { name: 'role_assign', description: 'Assign Permissions to roles' },
        ],
      },
      {
        group: 'supplier',
        permissions: [
          { name: 'supplier_create', description: 'Create suppliers' },
          { name: 'supplier_read', description: 'View suppliers' },
          { name: 'supplier_update', description: 'Edit suppliers' },
          { name: 'supplier_delete', description: 'Delete suppliers' },
        ],
      },
      {
        group: 'client',
        permissions: [
          { name: 'client_create', description: 'Create clients' },
          { name: 'client_read', description: 'View clients' },
          { name: 'client_update', description: 'Edit clients' },
          { name: 'client_delete', description: 'Delete clients' },
        ],
      },
      {
        group: 'party',
        permissions: [
          { name: 'party_create', description: 'Create Party' },
          { name: 'party_read', description: 'View Parties' },
          { name: 'party_update', description: 'Edit Party' },
          { name: 'party_delete', description: 'Delete Party' },
        ],
      },
      {
        group: 'dashboard',
        permissions: [
          { name: 'dashboard_read', description: 'View dashboards' },
          {
            name: 'dashboard_stats_card_read',
            description: 'View dashboards Stats Cards',
          },
          {
            name: 'dashboard_activities_read',
            description: 'View system Activities',
          },
        ],
      },
      {
        group: 'report',
        permissions: [{ name: 'report_read', description: 'View reports' }],
      },
      {
        group: 'activity_logs',
        permissions: [
          { name: 'activity_logs_read', description: 'View Activit Logs' },
        ],
      },
      {
        group: 'administration',
        permissions: [
          { name: 'administration_read', description: 'View administrations' },
        ],
      },
      {
        group: 'settings',
        permissions: [
          { name: 'settings_read', description: 'View All settings' },
          {
            name: 'settings_set_cron_schedule',
            description:
              'Set Cron Schedule to check for contracts exipirations',
          },
        ],
      },
      {
        group: 'compare_excel',
        permissions: [
          {
            name: 'compare_excel_read',
            description: 'Compare Excel for Reconcile',
          },
        ],
      },
      {
        group: 'asset_management',
        permissions: [
          {
            name: 'asset_management_read',
            description: 'View Asset Management',
          },
        ],
      },
      {
        group: 'asset',
        permissions: [
          { name: 'asset_create', description: 'Create Asset' },
          { name: 'asset_read', description: 'View Asset' },
          { name: 'asset_update', description: 'Edit Asset' },
          { name: 'asset_delete', description: 'Delete Asset' },
        ],
      },
      {
        group: 'asset_category',
        permissions: [
          {
            name: 'asset_category_create',
            description: 'Create Asset Category',
          },
          { name: 'asset_category_read', description: 'View Asset Category' },
          { name: 'asset_category_update', description: 'Edit Asset Category' },
          {
            name: 'asset_category_delete',
            description: 'Delete Asset Category',
          },
        ],
      },
      {
        group: 'asset_request',
        permissions: [
          { name: 'asset_request_create', description: 'Create Asset Request' },
          { name: 'asset_request_read', description: 'View Asset Request' },
          { name: 'asset_request_update', description: 'Edit Asset Request' },
          { name: 'asset_request_delete', description: 'Delete Asset Request' },
        ],
      },
    ];

    const allPermissions: Permission[] = [];

    for (const group of permissionGroups) {
      for (const perm of group.permissions) {
        const existing = await this.permissionRepository.findOne({
          where: { name: perm.name },
        });

        if (!existing) {
          const newPermission = this.permissionRepository.create({
            ...perm,
            group: group.group,
          });
          allPermissions.push(
            await this.permissionRepository.save(newPermission),
          );
        } else {
          allPermissions.push(existing);
        }
      }
    }

    return allPermissions;
  }

  async seedAdminUser() {
    // 1. Seed permissions
    const permissions = await this.seedPermissions();

    // 2. Ensure admin role exists with all permissions
    let adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
      relations: ['permissions'],
    });

    if (!adminRole) {
      adminRole = await this.roleRepository.save({
        name: 'admin',
        description: 'Administrator',
        permissions, // Assign all permissions
      });
    } else {
      // Update existing role with any new permissions
      const existingPermissionIds = adminRole.permissions.map((p) => p.id);
      const newPermissions = permissions.filter(
        (p) => !existingPermissionIds.includes(p.id),
      );

      if (newPermissions.length > 0) {
        adminRole.permissions = [...adminRole.permissions, ...newPermissions];
        await this.roleRepository.save(adminRole);
      }
    }

    // 3. Check if admin user already exists
    const adminEmail = 'bmwandobo@mwalimubank.co.tz';

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
      relations: ['role'],
    });

    if (!existingAdmin) {
      // 4. Create admin user
      const hashedPassword = await bcrypt.hash('123456', 10);

      await this.userRepository.save({
        name: 'Super Administrator',
        email: adminEmail,
        username: 'admin',
        password: hashedPassword,
        role: adminRole,
        isActive: true,
      });

      console.log('Admin user with full permissions seeded successfully!');
    } else {
      console.log('Admin user already exists');
    }
  }
}
