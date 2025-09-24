import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { AssetCategoryEntity } from '../asset-category/asset-category.entity';

@Entity('assets')
export class AssetEntity extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => AssetCategoryEntity, (assetCategory) => assetCategory.assets)
  category: AssetCategoryEntity;
}
