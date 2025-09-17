import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Contract } from '../../contracts/entities/contracts.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('departments')
export class Department extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Contract, (contract) => contract.department)
  contracts: Contract[];

  @OneToMany(() => User, (user) => user.department)
  users: User[];
}
