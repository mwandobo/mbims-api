// contracts/entities/contract.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Contract } from '../../contracts/entities/contracts.entity';

@Entity('sub_contracts')
export class SubContract extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  amount: string;

  @Column('text')
  description: string;

  @ManyToOne(() => Contract, (contract) => contract.subContracts)
  contract: Contract;

  @Column({ nullable: true })
  fileUrl: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;
}
