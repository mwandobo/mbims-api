import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('excel_comparison')
export class ExcelComparisonEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  fileUrl: string;
}
