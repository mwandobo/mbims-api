import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department])], // must import the entity here
  controllers: [DepartmentController],
  providers: [DepartmentService],
})
export class DepartmentModule {}
