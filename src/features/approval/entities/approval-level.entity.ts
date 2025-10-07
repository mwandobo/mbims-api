// approval-level.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserApproval } from './user-approval.entity';
import { Role } from '../../../admnistration/roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';


@Entity('approval_levels')
export class ApprovalLevel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  level: string;

  @ManyToOne(() => UserApproval, (userApproval) => userApproval.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_approval_id' })
  userApproval: UserApproval;

  @ManyToOne(() => Role, (role) => role.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
