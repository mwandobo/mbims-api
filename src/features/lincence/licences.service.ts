import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { CreateLicenceDto } from './dtos/create-licence.dto';
import { UpdateLicenceDto } from './dtos/update-licence.dto';
import { LicenceResponseDto } from './dtos/licence-response.dto';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Licence } from './entities/licence.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { BaseService } from '../../common/services/base-service';
import { DepartmentEntity } from '../../admnistration/department/entities/department.entity';

@Injectable()
export class LicencesService extends BaseService<Licence> {
  private readonly UPLOAD_PATH = 'uploads/licences';

  constructor(
    @InjectRepository(Licence)
    private readonly licencesRepository: Repository<Licence>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
  ) {
    super(licencesRepository);
    this.ensureUploadDirectoryExists();
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<LicenceResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      ['supplier', 'department'], // relations

      {
        fields: ['title'], // fields in contracts table
        relations: {
          department: ['name'], // search supplier.name and supplier.email
          supplier: ['name', 'email'], // search client.name and client.email
        },
      },
    );

    return {
      ...response,
      data: response.data.map((licence) =>
        LicenceResponseDto.fromLicence(licence),
      ),
    };
  }

  async createLicence(
    createLicenceDto: CreateLicenceDto,
    file?: Express.Multer.File,
  ): Promise<Licence> {
    const {  department_id, ...licenceData } = createLicenceDto;

    const [department] = await Promise.all([
      department_id
        ? this.validateDepartment(department_id)
        : Promise.resolve(null),
    ]);

    const fileUrl = file ? await this.saveUploadedFile(file) : null;

    const count = await this.licencesRepository.count();

    // Format: SP-001, SP-002, ...
    const paddedCount = String(count + 1).padStart(3, '0');
    const reference_no = `SPL-${paddedCount}`;

    const licence = this.licencesRepository.create({
      ...licenceData,
      status: createLicenceDto.status || 'pending',
      // supplier: supplier,
      department,
      fileUrl,
      reference_no
    });

    return this.licencesRepository.save(licence);
  }

  async updateLicence(
    id: string,
    updateLicenceDto: UpdateLicenceDto,
  ): Promise<Licence> {
    const licence = await this.findLicenceById(id, ['supplier', 'department']);

    const {  department_id, ...updateData } = updateLicenceDto;

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

    return this.licencesRepository.save(licence);
  }

  async findOneLicence(id: string): Promise<LicenceResponseDto> {
    const licence = await this.findLicenceById(id, [ 'department']);

    return LicenceResponseDto.fromLicence(licence);
  }

  async deleteLicence(id: string): Promise<void> {
    const result = await this.licencesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Licence with ID ${id} not found`);
    }
  }

  private async findLicenceById(
    id: string,
    relations: string[] = [],
  ): Promise<Licence> {
    const licence = await this.licencesRepository.findOne({
      where: { id },
      relations,
    });

    if (!licence) {
      throw new NotFoundException(`Licence with ID ${id} not found`);
    }
    return licence;
  }

  private async validateSupplier(supplierId: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }
    return supplier;
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
    return `/uploads/licences/${filename}`;
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.UPLOAD_PATH)) {
      fs.mkdirSync(this.UPLOAD_PATH, { recursive: true });
    }
  }
}
