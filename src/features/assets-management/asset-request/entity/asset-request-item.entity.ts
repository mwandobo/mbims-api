// asset-request-item.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AssetRequestEntity } from './asset-request.entity';
import { AssetEntity } from '../../asset/asset.entity';
import { BaseEntity } from '../../../../common/entities/base.entity';

@Entity('asset_request_items')
export class AssetRequestItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssetRequestEntity, (request) => request.items)
  request: AssetRequestEntity;

  @ManyToOne(() => AssetEntity, (asset) => asset.requestItems)
  asset: AssetEntity;

  @Column({ nullable: true })
  quantity: number;
}
