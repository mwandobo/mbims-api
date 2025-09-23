import {
  Column,
  CreateDateColumn,
  Entity, JoinTable, ManyToMany, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, user => user.role) // One role has many users
  users: User[];

  // @OneToMany(() => Permission, permissions => permissions.role)
  // permissions: Permission[];

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions: Permission[];
  // Helper method to remove password before sending response
}