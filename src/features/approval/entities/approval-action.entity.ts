// approval-action.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApprovalLevel } from './approval-level.entity';
import { UserApproval } from './user-approval.entity';
import { Role } from '../../../admnistration/roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';
import { ApprovalActionEnum } from '../enums/approval-action.enum';

@Entity('approval_actions')
export class ApprovalAction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: ApprovalActionEnum,
    default: ApprovalActionEnum.PENDING,
    nullable: false,
  })
  action: ApprovalActionEnum;

  @Column({ nullable: true })
  entityName: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => ApprovalLevel, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'approval_level_id' })
  approvalLevel: ApprovalLevel;

  @ManyToOne(() => UserApproval, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_approval_id' })
  userApproval: UserApproval;

  @ManyToOne(() => Role, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
