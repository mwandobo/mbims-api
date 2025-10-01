import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity } from './asset.entity';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { AssetCategoryEntity } from '../asset-category/asset-category.entity';
import { AssetRequestItemEntity } from '../asset-request/entity/asset-request-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetEntity,
      AssetCategoryEntity,
      AssetRequestItemEntity,
    ]),
  ], // must import the entity here
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}