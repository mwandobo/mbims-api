// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractExtensionController } from './contract-extension.controller';
import { ContractExtensionService } from './contract-extension.service';
import { ContractExtension } from './entities/contract-extension.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ContractExtension])],
  controllers: [ContractExtensionController],
  providers: [ContractExtensionService],
  exports: [ContractExtensionService],
})
export class ContractExtensionModule {}