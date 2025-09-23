import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
 ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { DepartmentEntity } from '../../admnistration/department/entities/department.entity';

@Entity('licences')
export class Licence extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.contracts)
  department: DepartmentEntity;

  @ManyToOne(() => Supplier, (supplier) => supplier.contracts)
  supplier: Supplier;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  typeOfBusiness: string;

  @Column({ nullable: true })
  licenceNumber: string;

  @Column({ nullable: true })
  operatorName: string;

  @Column({ nullable: true })
  issuanceDate: string;

  @Column({ nullable: true })
  startDate: string;

  @Column({ nullable: true })
  endDate: string;
}