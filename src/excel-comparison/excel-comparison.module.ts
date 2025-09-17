// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelComparisonController } from './excel-comparison.controller';
import { ExcelComparisonService } from './excel-comparison.service';
import { Department } from '../department/entities/department.entity';
import { EmailModule } from '../common/mailer/email.module';
import { ExcelComparisonEntity } from './entities/excel-comparison.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExcelComparisonEntity, Department]),
    EmailModule,
  ],
  controllers: [ExcelComparisonController],
  providers: [ExcelComparisonService],
  exports: [ExcelComparisonService],
})
export class ExcelComparisonModule {}
