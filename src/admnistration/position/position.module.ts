import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { PositionEntity } from './entities/position.entity';
import { DepartmentEntity } from '../department/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PositionEntity, DepartmentEntity])], // must import the entity here
  controllers: [PositionController],
  providers: [PositionService],
})
export class PositionModule {}
