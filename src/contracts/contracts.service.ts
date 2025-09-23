import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { Contract } from './entities/contracts.entity';
import { CreateContractDto } from './dtos/create-contract.dto';
import { UpdateContractDto } from './dtos/update-contract.dto';
import { BaseService } from '../common/services/base-service';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../common/dtos/pagination.dto';
import { ContractResponseDto } from './dtos/contract-response.dto';
import { Party } from '../party/entities/party.entity';
import { DepartmentEntity } from '../admnistration/department/entities/department.entity';

@Injectable()
export class ContractsService extends BaseService<Contract> {
  private readonly UPLOAD_PATH = 'uploads/contracts';

  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
    // @InjectRepository(Supplier)
    // private readonly supplierRepository: Repository<Supplier>,
    // @InjectRepository(Client)
    // private readonly clientRepository: Repository<Client>,
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
  ) {
    super(contractsRepository);
    this.ensureUploadDirectoryExists();
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ContractResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['party', 'department'], // relations

      {
        fields: ['title', 'group'], // fields in contracts table
        relations: {
          department: ['name'], // search supplier.name and supplier.email
          party: ['name', 'email'], // search client.name and client.email
        },
      },
    );

    return {
      ...response,
      data: response.data.map((contract) =>
        ContractResponseDto.fromContract(contract),
      ),
    };
  }

  async createContract(
    createContractDto: CreateContractDto,
    file?: Express.Multer.File,
  ): Promise<Contract> {
    const { department_id, party_id, ...contractData } = createContractDto;

    const [party, department] = await Promise.all([
      this.validateParty(party_id),
      this.validateDepartment(department_id),
    ]);

    const fileUrl = file ? await this.saveUploadedFile(file) : null;
    const count = await this.contractsRepository.count();

    // Format: SP-001, SP-002, ...
    const paddedCount = String(count + 1).padStart(3, '0');
    const reference_no = `SPC-${paddedCount}`;

    const contract = this.contractsRepository.create({
      ...contractData,
      status: createContractDto.status || 'pending',
      party,
      department,
      fileUrl,
      reference_no,
    });

    return this.contractsRepository.save(contract);
  }

  async updateContract(
    id: string,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    const contract = await this.findContractById(id, ['party', 'department']);

    const { party_id, department_id, ...updateData } = updateContractDto;

    const promises = [];

    if (party_id) {
      promises.push(
        this.validateParty(party_id).then((party) => {
          contract.party = party;
        }),
      );
    }

    if (department_id) {
      promises.push(
        this.validateDepartment(department_id).then((department) => {
          contract.department = department;
        }),
      );
    }

    await Promise.all(promises);
    Object.assign(contract, updateData);

    return this.contractsRepository.save(contract);
  }

  async findOneContract(id: string): Promise<ContractResponseDto> {
    const contract = await this.contractsRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.party', 'party')
      .leftJoinAndSelect('contract.department', 'department')
      .leftJoinAndSelect('contract.contractExtensions', 'contractExtensions')
      .where('contract.id = :id', { id })
      .getOne();

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // Calculate the farthest extended date and sum of amounts
    let farthestExtendedDate: string | null = null;
    let totalExtensionAmount = 0;

    if (contract.contractExtensions && contract.contractExtensions.length > 0) {
      // Find the farthest extended date by comparing string dates in 'YYYY-MM-DD' format
      farthestExtendedDate = contract.contractExtensions.reduce(
        (latest, extension) => {
          return extension.extendedDate > latest
            ? extension.extendedDate
            : latest;
        },
        contract.contractExtensions[0].extendedDate,
      );

      // Calculate sum of amounts
      totalExtensionAmount = contract.contractExtensions.reduce(
        (sum, extension) => sum + Number(extension.amount),
        0,
      );
    }

    return ContractResponseDto.fromContract(contract, {
      farthestExtendedDate,
      totalExtensionAmount,
    });
  }

  async deleteContract(id: string): Promise<void> {
    const result = await this.contractsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }
  }

  private async findContractById(
    id: string,
    relations: string[] = [],
  ): Promise<Contract> {
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations,
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }
    return contract;
  }

  private async validateParty(partyId: string): Promise<Party> {
    const party = await this.partyRepository.findOne({
      where: { id: partyId },
    });
    if (!party) {
      throw new NotFoundException(`Party with ID ${partyId} not found`);
    }
    return party;
  }

  // private async validateClient(clientId: string): Promise<Supplier> {
  //   const client = await this.clientRepository.findOne({
  //     where: { id: clientId },
  //   });
  //   if (!client) {
  //     throw new NotFoundException(`Client with ID ${clientId} not found`);
  //   }
  //   return client;
  // }

  private async validateDepartment(departmentId: string): Promise<DepartmentEntity> {
    const department = await this.departmentsRepository.findOne({
      where: { id: departmentId },
    });
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }
    return department;
  }

  private async saveUploadedFile(
    file?: Express.Multer.File, // This is the correct usage
  ): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const fullPath = path.join(this.UPLOAD_PATH, filename);
    await fs.promises.writeFile(fullPath, file.buffer);
    return `/uploads/contracts/${filename}`;
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.UPLOAD_PATH)) {
      fs.mkdirSync(this.UPLOAD_PATH, { recursive: true });
    }
  }
}
