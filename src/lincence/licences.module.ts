// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicencesController } from './licences.controller';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Licence } from './entities/licence.entity';
import { LicencesService } from './licences.service';
import { DepartmentEntity } from '../admnistration/department/entities/department.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Licence, Supplier, DepartmentEntity])],
  controllers: [LicencesController],
  providers: [LicencesService],
  exports: [LicencesService],
})
export class LicencesModule {}