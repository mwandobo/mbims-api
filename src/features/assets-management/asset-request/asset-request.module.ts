import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRequestEntity } from './entity/asset-request.entity';
import { AssetRequestService } from './services/asset-request.service';
import { AssetRequestController } from './controllers/asset-request.controller';
import { AssetRequestItemEntity } from './entity/asset-request-item.entity';
import { AssetEntity } from '../asset/asset.entity';
import { RequestedAssetsController } from './controllers/asset-request-item.controller';
import { RequestedAssetsService } from './services/requested-assets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetRequestEntity,
      AssetEntity,
      AssetRequestItemEntity,
    ]),
  ], // must import the entity here
  controllers: [AssetRequestController, RequestedAssetsController],
  providers: [AssetRequestService, RequestedAssetsService],
})
export class AssetRequestModule {}
