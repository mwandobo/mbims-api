import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { Department } from '../../department/entities/department.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'username', nullable: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role; // Use Relation type

  @ManyToOne(() => Department, (department) => department.users)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'can_receive_email', default: false, type: 'boolean' })
  canReceiveEmail: boolean;
}