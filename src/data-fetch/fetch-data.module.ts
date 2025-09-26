import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Client } from '../clients/entities/client.entity';
import { FetchDataController } from './data-fetch.controller';
import { DataFetchService } from './data-fetch.service';
import { Role } from '../admnistration/roles/entities/role.entity';
import { Party } from '../party/entities/party.entity';
import { DepartmentEntity } from '../admnistration/department/entities/department.entity';
import { AssetCategoryEntity } from '../assets-management/asset-category/asset-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Supplier,
      DepartmentEntity,
      Role,
      Party,
      AssetCategoryEntity,
    ]),
  ], // must import the entity here
  controllers: [FetchDataController],
  providers: [DataFetchService],
  exports: [DataFetchService],
})
export class FetchDataModule {}
