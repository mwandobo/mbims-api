import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repository/user.repository';
import { UsersController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Department } from '../department/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Department])], // must import the entity here
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService]
})
export class UserModule {}
