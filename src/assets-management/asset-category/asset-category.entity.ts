import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { AssetEntity } from '../asset/asset.entity';

@Entity('asset_categories')
export class AssetCategoryEntity extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @OneToMany(() => AssetEntity, (asset) => asset.category)
  assets: AssetEntity[];
}
