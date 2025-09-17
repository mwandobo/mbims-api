// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicencesController } from './licences.controller';
import { Department } from '../department/entities/department.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Licence } from './entities/licence.entity';
import { LicencesService } from './licences.service';


@Module({
  imports: [TypeOrmModule.forFeature([Licence, Supplier, Department])],
  controllers: [LicencesController],
  providers: [LicencesService],
  exports: [LicencesService],
})
export class LicencesModule {}