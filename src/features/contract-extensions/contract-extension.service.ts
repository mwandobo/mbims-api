import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';

import { BaseService } from '../../common/services/base-service';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { ContractExtensionResponseDto } from './dtos/contract-extension-response.dto';
import { CreateContractExtensionDto } from './dtos/create-contract-extension.dto';
import { UpdateContractExtensionDto } from './dtos/update-contract-extension.dto';
import { ContractExtension } from './entities/contract-extension.entity';

@Injectable()
export class ContractExtensionService extends BaseService<ContractExtension> {
  private readonly UPLOAD_PATH = 'uploads/contracts-extensions';

  constructor(
    @InjectRepository(ContractExtension)
    private readonly contractExtensionRepository: Repository<ContractExtension>,
  ) {
    super(contractExtensionRepository);
    this.ensureUploadDirectoryExists();
  }

  // async findAll(
  //   contractId: string,
  //   pagination: PaginationDto,
  // ): Promise<PaginatedResponseDto<ContractExtensionResponseDto>> {
  //   const response = await this.findAllPaginated(
  //     pagination,
  //     ['contract'], // relations
  //
  //     {
  //       fields: ['title'], // fields in contracts table
  //     },
  //   );
  //
  //   return {
  //     ...response,
  //     data: response.data.map((contractExtension) =>
  //       ContractExtensionResponseDto.fromContractExtension(contractExtension),
  //     ),
  //   };
  // }

  async findAll(
    contractId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ContractExtensionResponseDto>> {
    // Create a custom query builder that includes the contractId filter
    const queryBuilder = this.repository
      .createQueryBuilder('extension')
      .leftJoinAndSelect('extension.contract', 'contract')
      .where('contract.id = :contractId', { contractId });

    // Apply search if query exists
    if (pagination.q) {
      queryBuilder.andWhere('LOWER(extension.title) LIKE LOWER(:query)', {
        query: `%${pagination.q}%`,
      });
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const data = await queryBuilder.skip(skip).take(limit).getMany();

    // Format the response according to your PaginatedResponseDto
    return new PaginatedResponseDto(
      data.map((extension) =>
        ContractExtensionResponseDto.fromContractExtension(extension),
      ),
      total,
      pagination,
    );
  }

  async createContractExtension(
    contractId: string,
    createContractExtensionDto: CreateContractExtensionDto,
    file?: Express.Multer.File,
  ): Promise<ContractExtension> {
    console.log('file', file);

    const fileUrl = file ? await this.saveUploadedFile(file) : null;

    const contract = this.contractExtensionRepository.create({
      ...createContractExtensionDto,
      fileUrl,
      contract: { id: contractId }, // Set the parent contract relation
    });

    return this.contractExtensionRepository.save(contract);
  }

  async updateContractExtension(
    id: string,
    updateContractExtensionDto: UpdateContractExtensionDto,
  ): Promise<ContractExtension> {
    const subContract = await this.findContractExtensionById(id);

    Object.assign(subContract, updateContractExtensionDto);

    return this.contractExtensionRepository.save(subContract);
  }

  async findOneContractExtension(
    id: string,
  ): Promise<ContractExtensionResponseDto> {
    const contract = await this.findContractExtensionById(id);

    return ContractExtensionResponseDto.fromContractExtension(contract);
  }

  async deleteContractExtension(id: string): Promise<void> {
    const result = await this.contractExtensionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ContractExtension with ID ${id} not found`);
    }
  }

  private async findContractExtensionById(
    id: string,
    relations: string[] = [],
  ): Promise<ContractExtension> {
    const contract = await this.contractExtensionRepository.findOne({
      where: { id },
      relations,
    });

    if (!contract) {
      throw new NotFoundException(`ContractExtension with ID ${id} not found`);
    }
    return contract;
  }

  private async saveUploadedFile(
    file?: Express.Multer.File, // This is the correct usage
  ): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const fullPath = path.join(this.UPLOAD_PATH, filename);
    await fs.promises.writeFile(fullPath, file.buffer);
    return `/uploads/contracts-extensions/${filename}`;
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.UPLOAD_PATH)) {
      fs.mkdirSync(this.UPLOAD_PATH, { recursive: true });
    }
  }
}
