import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('policies')
export class Policy extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  owner: string;

  @Column({ nullable: true })
  approvalDate: string;

  @Column({ nullable: true })
  issuanceDate: string;

  @Column({ nullable: true })
  nextRenewalDate: string;

  @ManyToOne(() => Department, (department) => department.contracts)
  department: Department;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  startDate: string;

  @Column({ nullable: true })
  endDate: string;
}