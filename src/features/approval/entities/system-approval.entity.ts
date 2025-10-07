// permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('sys_approvals')
export class SysApproval extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  entityName: string;

  @Column({ nullable: true })
  description: string;
}