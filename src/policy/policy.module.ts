// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyController } from './policy.controller';
import { Department } from '../department/entities/department.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { PolicyService } from './policy.service';
import { Policy } from './entities/policy.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Policy, Supplier, Department])],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}