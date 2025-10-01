import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../../features/users/entities/user.entity';
import { PositionEntity } from '../../position/entities/position.entity';
import { Contract } from '../../../features/contracts/entities/contracts.entity';

@Entity('departments')
export class DepartmentEntity extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @OneToMany(() => PositionEntity, (contract) => contract.department)
  positions: PositionEntity[];

  @OneToMany(() => Contract, (contract) => contract.department)
  contracts: Contract[];

  @OneToMany(() => User, (user) => user.department)
  users: User[];
}
