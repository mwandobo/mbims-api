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
import { SubContractResponseDto } from './dtos/sub-contract-response.dto';
import { CreateSubContractDto } from './dtos/create-sub-contract.dto';
import { UpdateSubContractDto } from './dtos/update-sub-contract.dto';
import { SubContract } from './entities/sub-contracts.entity';

@Injectable()
export class SubContractsService extends BaseService<SubContract> {
  private readonly UPLOAD_PATH = 'uploads/sub-contracts';

  constructor(
    @InjectRepository(SubContract)
    private readonly subContractsRepository: Repository<SubContract>,
  ) {
    super(subContractsRepository);
    this.ensureUploadDirectoryExists();
  }

  async findAll(
    contractId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SubContractResponseDto>> {
    // Create base query
    const queryBuilder = this.repository
      .createQueryBuilder('subContract')
      .leftJoinAndSelect('subContract.contract', 'contract')
      .where('contract.id = :contractId', { contractId });

    // Handle search if query exists
    if (pagination.q) {
      queryBuilder.andWhere('LOWER(subContract.title) LIKE LOWER(:query)', {
        query: `%${pagination.q}%`,
      });
    }

    // Get total count before pagination for accurate pagination info
    const total = await queryBuilder.getCount();

    // Apply pagination
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const data = await queryBuilder.skip(skip).take(limit).getMany();

    return new PaginatedResponseDto(
      data.map((subContract) =>
        SubContractResponseDto.fromSubContract(subContract),
      ),
      total,
      pagination,
    );
  }
  async createSubContract(
    contractId: string,
    createSubContractDto: CreateSubContractDto,
    file?: Express.Multer.File,
  ): Promise<SubContract> {
    const fileUrl = file ? await this.saveUploadedFile(file) : null;

    const count = await this.subContractsRepository.count();

    const paddedCount = String(count + 1).padStart(3, '0');
    const reference_no = `SPSC-${paddedCount}`;



    const contract = this.subContractsRepository.create({
      ...createSubContractDto,
      status: createSubContractDto.status || 'pending',
      fileUrl,
      contract: { id: contractId }, // Set the parent contract relation
      reference_no
    });

    return this.subContractsRepository.save(contract);
  }

  async updateSubContract(
    id: string,
    updateSubContractDto: UpdateSubContractDto,
  ): Promise<SubContract> {
    const subContract = await this.findSubContractById(id);

    Object.assign(subContract, updateSubContractDto);

    return this.subContractsRepository.save(subContract);
  }

  async findOneSubContract(id: string): Promise<SubContractResponseDto> {
    const contract = await this.findSubContractById(id);
    return SubContractResponseDto.fromSubContract(contract);
  }

  async deleteSubContract(id: string): Promise<void> {
    const result = await this.subContractsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SubContract with ID ${id} not found`);
    }
  }

  private async findSubContractById(
    id: string,
    relations: string[] = [],
  ): Promise<SubContract> {
    const contract = await this.subContractsRepository.findOne({
      where: { id },
      relations,
    });

    if (!contract) {
      throw new NotFoundException(`SubContract with ID ${id} not found`);
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
