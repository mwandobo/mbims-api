import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { CreatePolicyDto } from './dtos/create-policy.dto';
import { UpdatePolicyDto } from './dtos/update-policy.dto';
import { PolicyResponseDto } from './dtos/policy-response.dto';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { BaseService } from '../../common/services/base-service';
import { Policy } from './entities/policy.entity';
import { DepartmentEntity } from '../../admnistration/department/entities/department.entity';

@Injectable()
export class PolicyService extends BaseService<Policy> {
  private readonly UPLOAD_PATH = 'uploads/policies';

  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,

    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
  ) {
    super(policyRepository);
    this.ensureUploadDirectoryExists();
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<PolicyResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      [ 'department'], // relations
      {
        fields: ['title'], // fields in contracts table
        relations: {
          department: ['name'], // search supplier.name and supplier.email
        },
      },
    );

    return {
      ...response,
      data: response.data.map((licence) =>
        PolicyResponseDto.fromLicence(licence),
      ),
    };
  }

  async create(
    createPolicyDto: CreatePolicyDto,
    file?: Express.Multer.File,
  ): Promise<Policy> {
    const { department_id, ...licenceData } = createPolicyDto;

    const [ department] = await Promise.all([
      department_id
        ? this.validateDepartment(department_id)
        : Promise.resolve(null),
    ]);

    const fileUrl = file ? await this.saveUploadedFile(file) : null;

    const count = await this.policyRepository.count();

    // Format: SP-001, SP-002, ...
    const paddedCount = String(count + 1).padStart(3, '0');
    const reference_no = `SPL-${paddedCount}`;

    const licence = this.policyRepository.create({
      ...licenceData,
      status: createPolicyDto.status || 'pending',
      department,
      fileUrl,
      reference_no,
    });

    return this.policyRepository.save(licence);
  }

  async update(
    id: string,
    updatePolicyDto: UpdatePolicyDto,
  ): Promise<Policy> {
    const licence = await this.findById(id, [ 'department']);

    const {  department_id, ...updateData } = updatePolicyDto;

    const promises = [];


    if (department_id) {
      promises.push(
        this.validateDepartment(department_id).then((department) => {
          licence.department = department;
        }),
      );
    }

    await Promise.all(promises);
    Object.assign(licence, updateData);

    return this.policyRepository.save(licence);
  }

  async findOne(id: string): Promise<PolicyResponseDto> {
    const licence = await this.findById(id, [ 'department']);

    return PolicyResponseDto.fromLicence(licence);
  }

  async delete(id: string): Promise<void> {
    const result = await this.policyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Licence with ID ${id} not found`);
    }
  }

  private async findById(
    id: string,
    relations: string[] = [],
  ): Promise<Policy> {
    const licence = await this.policyRepository.findOne({
      where: { id },
      relations,
    });

    if (!licence) {
      throw new NotFoundException(`Licence with ID ${id} not found`);
    }
    return licence;
  }


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
    return `/uploads/policies/${filename}`;
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.UPLOAD_PATH)) {
      fs.mkdirSync(this.UPLOAD_PATH, { recursive: true });
    }
  }
}
