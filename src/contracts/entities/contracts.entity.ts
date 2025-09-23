// contracts/entities/contract.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Client } from '../../clients/entities/client.entity';
import { SubContract } from '../../sub-contracts/entities/sub-contracts.entity';
import { ContractFile } from '../../contract-files/entities/contract-files.entity';
import { ContractExtension } from '../../contract-extensions/entities/contract-extension.entity';
import { Party } from '../../party/entities/party.entity';
import { DepartmentEntity } from '../../admnistration/department/entities/department.entity';

@Entity('contracts')
export class Contract extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  amount: string;

  @Column('text')
  description: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.contracts)
  department: DepartmentEntity;

  @Column({ default: 'supplier' })
  group: 'supplier' | 'client';

  @ManyToOne(() => Supplier, (supplier) => supplier.contracts)
  supplier: Supplier;

  @ManyToOne(() => Client, (client) => client.contracts)
  client: Client;

  @ManyToOne(() => Party, (party) => party.contracts)
  party: Party;

  @OneToMany(() => SubContract, (contract) => contract.contract)
  subContracts: SubContract[];

  @OneToMany(() => ContractFile, (contract) => contract.contract)
  contractFiles: ContractFile[];

  @OneToMany(() => ContractExtension, (contract) => contract.contract)
  contractExtensions: ContractExtension[];

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  issueDate: string;

  @Column({ nullable: true })
  issuingAuthority: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;
}
