// settings/entities/setting.entity.ts
import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('settings')
export class Setting extends BaseEntity{
  @Column({ unique: true })
  key: string

  @Column()
  value: string
}