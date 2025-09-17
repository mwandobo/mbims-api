import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Role } from '../roles/entities/role.entity';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])], // must import the entity here
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
