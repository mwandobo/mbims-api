import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Contract } from '../../contracts/entities/contracts.entity';

@Entity('parties')
export class Party extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  fileUrl: string;

  @OneToMany(() => Contract, (contract) => contract.party)
  contracts: Contract[];
}
