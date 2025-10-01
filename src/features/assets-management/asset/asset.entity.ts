import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AssetCategoryEntity } from '../asset-category/asset-category.entity';
import { AssetRequestItemEntity } from '../asset-request/entity/asset-request-item.entity';

@Entity('assets')
export class AssetEntity extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => AssetCategoryEntity, (assetCategory) => assetCategory.assets)
  category: AssetCategoryEntity;

  @OneToMany(() => AssetRequestItemEntity, (item) => item.asset)
  requestItems: AssetRequestItemEntity[];
}
