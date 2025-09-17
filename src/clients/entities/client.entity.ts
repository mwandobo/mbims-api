import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Contract } from '../../contracts/entities/contracts.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({nullable: true})
  dateOfBirth: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Contract, (contract) => contract.client)
  contracts: Contract[];

}