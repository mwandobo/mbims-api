import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { Role } from '../../../admnistration/roles/entities/role.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../../common/dtos/pagination.dto';
import { BaseService } from '../../../common/services/base-service';
import { DepartmentEntity } from '../../../admnistration/department/entities/department.entity';
import { ApprovalStatusUtil } from '../../approval/utils/approval-status.util';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    approvalStatusUtil: ApprovalStatusUtil, // <--- inject it here
  ) {
    super(usersRepository, approvalStatusUtil, 'User');
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['role', 'department'], // relations
      {
        fields: ['name', 'email'], // fields in contracts table
        relations: {
          department: ['name'], // search supplier.name and supplier.email
          role: ['name'], // search client.name and client.email
        },
      },
    );

    return {
      ...response,
      data: response.data.map((user) => {
        const dto = UserResponseDto.fromUser(user);
        dto.approvalStatus = (user as any).approvalStatus ?? 'N/A';
        return dto;
      }),
    };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    // Check for existing user
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password (using default '123456' as in your example)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with relationships
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      // role, // Assign the loaded role entity
      // department, // Assign the loaded department entity
    });

    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'department'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserResponseDto.fromUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'department'], // Load existing relations
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Handle password update
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.role_id) {
      const role = await this.roleRepository.findOne({
        where: { id: updateUserDto.role_id },
      });
      if (!role) {
        throw new NotFoundException(
          `Role with ID ${updateUserDto.role_id} not found`,
        );
      }
      user.role = role;
    }

    // Handle department update
    if (updateUserDto.department_id) {
      const department = await this.departmentRepository.findOne({
        where: { id: updateUserDto.department_id },
      });
      if (!department) {
        throw new NotFoundException(
          `Department with ID ${updateUserDto.department_id} not found`,
        );
      }
      user.department = department;
    }

    console.log('updateUserDto.canReceiveEmail', updateUserDto.canReceiveEmail);

    // Update regular fields
    Object.assign(user, {
      name: updateUserDto.name,
      canReceiveEmail: updateUserDto.canReceiveEmail
    });

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findForAuth(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'], // Explicitly include password
      relations: ['role.permissions'], // Load role relationship
    });
  }
}
