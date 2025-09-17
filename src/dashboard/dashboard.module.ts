// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { Contract } from '../contracts/entities/contracts.entity';
import { DashboardController } from './dashboard.controller';
import { Policy } from '../policy/entities/policy.entity';
import { Licence } from '../lincence/entities/licence.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Contract, Licence, Policy])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}