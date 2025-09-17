// contracts/entities/contract.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
 ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Contract } from '../../contracts/entities/contracts.entity';

@Entity('contract_files')
export class ContractFile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => Contract, (contract) => contract.contractFiles)
  contract: Contract;

  @Column({ nullable: true })
  fileUrl: string;
}