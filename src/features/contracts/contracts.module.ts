// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { Contract } from './entities/contracts.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Client } from '../clients/entities/client.entity';
import { EmailModule } from '../../common/mailer/email.module';
import { Party } from '../party/entities/party.entity';
import { DepartmentEntity } from '../../admnistration/department/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contract,
      Supplier,
      DepartmentEntity,
      Client,
      Party,
    ]),
    EmailModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
