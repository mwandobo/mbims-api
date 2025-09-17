import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../department/entities/department.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Client } from '../clients/entities/client.entity';
import { FetchDataController } from './data-fetch.controller';
import { DataFetchService } from './data-fetch.service';
import { Role } from '../roles/entities/role.entity';
import { Party } from '../party/entities/party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Supplier, Department, Role, Party])], // must import the entity here
  controllers: [FetchDataController],
  providers: [DataFetchService],
  exports: [DataFetchService]
})
export class FetchDataModule {}
