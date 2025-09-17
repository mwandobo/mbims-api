// contracts/excel-comparison.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubContractsController } from './sub-contracts.controller';
import { SubContract } from './entities/sub-contracts.entity';
import { SubContractsService } from './sub-contracts.service';


@Module({
  imports: [TypeOrmModule.forFeature([SubContract])],
  controllers: [SubContractsController],
  providers: [SubContractsService],
  exports: [SubContractsService],
})
export class SubContractsModule {}