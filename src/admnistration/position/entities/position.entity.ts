import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DepartmentEntity } from '../../department/entities/department.entity';
import { User } from '../../../features/users/entities/user.entity';

@Entity('positions')
export class PositionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.positions)
  department: DepartmentEntity;

  @OneToMany(() => User, (user) => user.position)
  users: User[];

}
