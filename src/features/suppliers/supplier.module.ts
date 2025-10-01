import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersController } from './controllers/supplier.controller';
import { SuppliersService } from './services/suppliers.service';
import { Supplier } from './entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])], // must import the entity here
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService]
})
export class SupplierModule {}
