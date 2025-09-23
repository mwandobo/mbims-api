import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { DepartmentEntity } from './entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity])], // must import the entity here
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
