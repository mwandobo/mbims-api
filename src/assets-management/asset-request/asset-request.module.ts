import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRequestEntity } from './entity/asset-request.entity';
import { AssetRequestService } from './asset-request.service';
import { AssetRequestController } from './asset-request.controller';
import { AssetRequestItemEntity } from './entity/asset-request-item.entity';
import { AssetEntity } from '../asset/asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetRequestEntity,
      AssetEntity,
      AssetRequestItemEntity,
    ]),
  ], // must import the entity here
  controllers: [AssetRequestController],
  providers: [AssetRequestService],
})
export class AssetRequestModule {}
