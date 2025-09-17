import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dtos/create-client.dto';
import { ClientResponseDto } from '../dtos/client-response.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import { BaseService } from '../../common/services/base-service';

@Injectable()
export class ClientsService extends BaseService<Client> {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {
    super(clientRepository);
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const { email } = createClientDto;

    // Check for existing client
    const existingClient = await this.findByEmail(email);
    if (existingClient) {
      throw new BadRequestException('Client with this email already exists');
    }

    // Create client with relationships
    const client = this.clientRepository.create({
      ...createClientDto,
    });

    return this.clientRepository.save(client);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ClientResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      [], // relations
      {
        fields: ['name', 'email'], // fields in contracts table
      },
    );

    return {
      ...response,
      data: response.data.map((client) => ClientResponseDto.fromClient(client)),
    };
  }

  async findOne(id: string): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return ClientResponseDto.fromClient(client);
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Update regular fields
    Object.assign(client, {
      name: updateClientDto.firstName,
      email: updateClientDto.email,
      phone: updateClientDto.phone,
      dateOfBirth: updateClientDto.dateOfBirth,
    });

    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    await this.clientRepository.delete(id);
  }

  async findByEmail(email: string): Promise<Client | undefined> {
    return this.clientRepository.findOne({
      where: { email },
    });
  }
}
