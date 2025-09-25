import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AssetCategoryEntity } from '../../asset-category/asset-category.entity';
import { AssetRequestItemEntity } from './asset-request-item.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('asset_requests')
export class AssetRequestEntity extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => AssetCategoryEntity, (assetCategory) => assetCategory.assets)
  category: AssetCategoryEntity;

  @OneToMany(() => AssetRequestItemEntity, (item) => item.request)
  items: AssetRequestItemEntity[];
}
