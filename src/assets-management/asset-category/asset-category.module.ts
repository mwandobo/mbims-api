import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetCategoryEntity } from './asset-category.entity';
import { AssetCategoryController } from './asset-category.controller';
import { AssetCategoryService } from './asset-category.service';


@Module({
  imports: [TypeOrmModule.forFeature([AssetCategoryEntity])], // must import the entity here
  controllers: [AssetCategoryController],
  providers: [AssetCategoryService],
})
export class AssetCategoryModule {}
