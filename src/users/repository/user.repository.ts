import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.repository.findOne({
      where: { email },
      relations: ['roles', 'departments'],
    });
  }


  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find({
      relations: ['roles', 'departments'],
    });
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.repository.findOne({
      where: { id },
      relations: ['roles', 'departments'],
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.repository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}