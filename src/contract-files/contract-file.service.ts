import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';

import { BaseService } from '../common/services/base-service';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../common/dtos/pagination.dto';
import { ContractFileResponseDto } from './dtos/contract-file-response.dto';
import { CreateContractFileDto } from './dtos/create-contract-file.dto';
import { UpdateContractFileDto } from './dtos/update-contract-file.dto';
import { ContractFile } from './entities/contract-files.entity';

@Injectable()
export class ContractFileService extends BaseService<ContractFile> {
  private readonly UPLOAD_PATH = 'uploads/sub-contracts';

  constructor(
    @InjectRepository(ContractFile)
    private readonly contractFileRepository: Repository<ContractFile>,
  ) {
    super(contractFileRepository);
    this.ensureUploadDirectoryExists();
  }

  async findAll(
    contractId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<ContractFileResponseDto>> {
    // Create base query with contract filtering
    const queryBuilder = this.repository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.contract', 'contract')
      .where('contract.id = :contractId', { contractId });

    // Apply search if query exists
    if (pagination.q) {
      queryBuilder.andWhere('LOWER(file.title) LIKE LOWER(:query)', {
        query: `%${pagination.q}%`,
      });
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const data = await queryBuilder.skip(skip).take(limit).getMany();

    // Format the response
    return new PaginatedResponseDto(
      data.map((file) => ContractFileResponseDto.fromContractFile(file)),
      total,
      pagination,
    );
  }

  async createContractFile(
    contractId: string,
    createContractFileDto: CreateContractFileDto,
    file?: Express.Multer.File,
  ): Promise<ContractFile> {
    console.log('file', file);

    const fileUrl = file ? await this.saveUploadedFile(file) : null;

    const contract = this.contractFileRepository.create({
      ...createContractFileDto,
      fileUrl,
      contract: { id: contractId }, // Set the parent contract relation
    });

    return this.contractFileRepository.save(contract);
  }

  async updateContractFile(
    id: string,
    updateContractFileDto: UpdateContractFileDto,
  ): Promise<ContractFile> {
    const subContract = await this.findContractFileById(id);

    Object.assign(subContract, updateContractFileDto);

    return this.contractFileRepository.save(subContract);
  }

  async findOneContractFile(id: string): Promise<ContractFileResponseDto> {
    const contract = await this.findContractFileById(id);

    return ContractFileResponseDto.fromContractFile(contract);
  }

  async deleteContractFile(id: string): Promise<void> {
    const result = await this.contractFileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ContractFile with ID ${id} not found`);
    }
  }

  private async findContractFileById(
    id: string,
    relations: string[] = [],
  ): Promise<ContractFile> {
    const contract = await this.contractFileRepository.findOne({
      where: { id },
      relations,
    });

    if (!contract) {
      throw new NotFoundException(`ContractFile with ID ${id} not found`);
    }
    return contract;
  }

  private async saveUploadedFile(
    file?: Express.Multer.File, // This is the correct usage
  ): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const fullPath = path.join(this.UPLOAD_PATH, filename);
    await fs.promises.writeFile(fullPath, file.buffer);
    return `/uploads/sub-contracts/${filename}`;
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.UPLOAD_PATH)) {
      fs.mkdirSync(this.UPLOAD_PATH, { recursive: true });
    }
  }
}
