// contracts/entities/contract.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Contract } from '../../contracts/entities/contracts.entity';

@Entity('contract_extensions')
export class ContractExtension extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  amount: string;

  @Column({ nullable: true })
  extendedDate: string;

  @Column('text')
  description: string;

  @ManyToOne(() => Contract, (contract) => contract.contractExtensions)
  contract: Contract;

  @Column({ nullable: true })
  fileUrl: string;
}
