import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './features/users/user.module';
import { RoleModule } from './admnistration/roles/role.module';
import { PermissionModule } from './admnistration/permissions/permission.module';
import { DepartmentModule } from './admnistration/department/department.module';
import { AuthModule } from './features/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './features/auth/guards/role.guard';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './features/auth/guards/auth.guard';
import { ContractsModule } from './features/contracts/contracts.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { LicencesModule } from './features/lincence/licences.module';
import { SubContractsModule } from './features/sub-contracts/sub-contracts.module';
import { FetchDataModule } from './features/data-fetch/fetch-data.module';
import { ContractFileModule } from './features/contract-files/contract-file.module';
import { ContractExtensionModule } from './features/contract-extensions/contract-extension.module';
import { CronJobModule } from './common/cron-job/cron-job.module';
import { PolicyModule } from './features/policy/policy.module';
import { ActivityLogsModule } from './common/activity-logs/activity-logs.module';
import { SettingsModule } from './features/settings/settings.module';
import { NotificationModule } from './notification/notification.module';
import { PartyModule } from './features/party/party.module';
import { ExcelComparisonModule } from './features/excel-comparison/excel-comparison.module';
import { PositionModule } from './admnistration/position/position.module';
import { AssetCategoryModule } from './features/assets-management/asset-category/asset-category.module';
import { AssetModule } from './features/assets-management/asset/asset.module';
import { AssetRequestModule } from './features/assets-management/asset-request/asset-request.module';
import { ApprovalsModule } from './features/approval/approvals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make config accessible anywhere
    }),
    DatabaseModule.forRoot(),
    RoleModule,
    PermissionModule,
    UserModule,
    DepartmentModule,
    AuthModule,
    CommonModule,
    // SupplierModule,
    // ClientModule,
    PartyModule,
    LicencesModule,
    ContractsModule,
    SubContractsModule,
    DashboardModule,
    FetchDataModule,
    ContractFileModule,
    ContractExtensionModule,
    CronJobModule,
    PolicyModule,
    ActivityLogsModule,
    SettingsModule,
    NotificationModule,
    ExcelComparisonModule,
    PositionModule,
    AssetCategoryModule,
    AssetModule,
    AssetRequestModule,
    ApprovalsModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,  // Register JwtAuthGuard first
    },
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
