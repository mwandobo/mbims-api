import { Module } from '@nestjs/common';

import { AdminUserSeederService } from './seeders/admin-user-seeder';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])], // must import the entity here
  controllers: [],
  providers: [AdminUserSeederService],
})
export class CommonModule {}
