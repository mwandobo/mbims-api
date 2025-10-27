// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AssetCategoryEntity } from '../assets-management/asset-category/asset-category.entity';
import { AssetEntity } from '../assets-management/asset/asset.entity';
import { AssetRequestEntity } from '../assets-management/asset-request/entity/asset-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetCategoryEntity,
      AssetEntity,
      AssetRequestEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
