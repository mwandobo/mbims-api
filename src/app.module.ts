import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { RoleModule } from './admnistration/roles/role.module';
import { PermissionModule } from './admnistration/permissions/permission.module';
import { DepartmentModule } from './admnistration/department/department.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/role.guard';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './auth/guards/auth.guard';
import { ContractsModule } from './contracts/contracts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ClientModule } from './clients/client.module';
import { SupplierModule } from './suppliers/supplier.module';
import { LicencesModule } from './lincence/licences.module';
import { SubContractsModule } from './sub-contracts/sub-contracts.module';
import { FetchDataModule } from './data-fetch/fetch-data.module';
import { ContractFileModule } from './contract-files/contract-file.module';
import { ContractExtensionModule } from './contract-extensions/contract-extension.module';
import { CronJobModule } from './common/cron-job/cron-job.module';
import { PolicyModule } from './policy/policy.module';
import { ActivityLogsModule } from './common/activity-logs/activity-logs.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationModule } from './notification/notification.module';
import { PartyModule } from './party/party.module';
import { ExcelComparisonModule } from './excel-comparison/excel-comparison.module';
import { PositionModule } from './admnistration/position/position.module';

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
    PositionModule
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
