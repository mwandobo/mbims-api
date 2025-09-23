import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { SupplierResponseDto } from '../suppliers/dtos/supplier-response.dto';
import { ClientResponseDto } from '../clients/dtos/client-response.dto';
import { DepartmentResponseDto } from '../admnistration/department/dtos/department-response.dto';
import { RoleResponseDto } from '../admnistration/roles/dtos/role-response.dto';
import { Role } from '../admnistration/roles/entities/role.entity';
import { PartyResponseDto } from '../party/dtos/party-response.dto';
import { Party } from '../party/entities/party.entity';
import { DepartmentEntity } from '../admnistration/department/entities/department.entity';

@Injectable()
export class DataFetchService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {}

  async getSuppliers(): Promise<SupplierResponseDto[]> {
    const response = await this.supplierRepository.find();
    return response.map((client) => SupplierResponseDto.fromSupplier(client));
  }

  async getClients(): Promise<ClientResponseDto[]> {
    const response = await this.clientRepository.find();
    return response.map((client) => ClientResponseDto.fromClient(client));
  }

  async getDepartments(): Promise<DepartmentResponseDto[]> {
    const response = await this.departmentRepository.find();
    return response.map((client) =>
      DepartmentResponseDto.fromDepartment(client),
    );
  }

  async getParties(): Promise<PartyResponseDto[]> {
    const response = await this.partyRepository.find();
    return response.map((client) =>
      PartyResponseDto.fromParty(client),
    );
  }

  async getRoles(): Promise<RoleResponseDto[]> {
    const response = await this.roleRepository.find();
    return response.map((client) =>
      RoleResponseDto.fromRole(client),
    );
  }
}
