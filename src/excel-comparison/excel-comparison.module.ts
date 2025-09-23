// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelComparisonController } from './excel-comparison.controller';
import { ExcelComparisonService } from './excel-comparison.service';
import { EmailModule } from '../common/mailer/email.module';
import { ExcelComparisonEntity } from './entities/excel-comparison.entity';
import { DepartmentEntity } from '../admnistration/department/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExcelComparisonEntity, DepartmentEntity]),
    EmailModule,
  ],
  controllers: [ExcelComparisonController],
  providers: [ExcelComparisonService],
  exports: [ExcelComparisonService],
})
export class ExcelComparisonModule {}
