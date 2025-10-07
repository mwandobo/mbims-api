// user-approval.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SysApproval } from './system-approval.entity';

@Entity('user_approvals')
export class UserApproval extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToOne(() => SysApproval, { eager: true })
  @JoinColumn({ name: 'sys_approval_id', referencedColumnName: 'id' })
  sysApproval: SysApproval;

}
