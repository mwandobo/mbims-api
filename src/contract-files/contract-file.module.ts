// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractFileController } from './contract-file.controller';
import { ContractFileService } from './contract-file.service';
import { ContractFile } from './entities/contract-files.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ContractFile])],
  controllers: [ContractFileController],
  providers: [ContractFileService],
  exports: [ContractFileService],
})
export class ContractFileModule {}