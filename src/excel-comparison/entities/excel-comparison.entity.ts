import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { BaseEntity } from '../../common/entities/base.entity';

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

  @ManyToOne(() => Department, (department) => department.contracts)
  department: Department;
}
