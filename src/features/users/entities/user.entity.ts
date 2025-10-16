import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../../admnistration/roles/entities/role.entity';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DepartmentEntity } from '../../../admnistration/department/entities/department.entity';
import { AssetRequestItemEntity } from '../../assets-management/asset-request/entity/asset-request-item.entity';
import { AssetRequestEntity } from '../../assets-management/asset-request/entity/asset-request.entity';

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

  @ManyToOne(() => DepartmentEntity, (department) => department.users)
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'can_receive_email', default: false, type: 'boolean' })
  canReceiveEmail: boolean;

  @OneToMany(() => AssetRequestEntity, (assetRequest) => assetRequest.user)
  assetRequests: AssetRequestEntity[];
}