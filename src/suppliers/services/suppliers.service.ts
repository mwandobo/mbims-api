import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../dtos/create-supplier.dto';
import { SupplierResponseDto } from '../dtos/supplier-response.dto';
import { UpdateSupplierDto } from '../dtos/update-supplier.dto';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../../common/dtos/pagination.dto';
import { BaseService } from '../../common/services/base-service';

@Injectable()
export class SuppliersService extends BaseService<Supplier> {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {
    super(supplierRepository);
  }

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const { email } = createSupplierDto;

    // Check for existing supplier
    const existingSupplier = await this.findByEmail(email);
    if (existingSupplier) {
      throw new BadRequestException('Supplier with this email already exists');
    }

    // Create supplier with relationships
    const supplier = this.supplierRepository.create({
      ...createSupplierDto,
    });

    return this.supplierRepository.save(supplier);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SupplierResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      [], // relations

      {
        fields: ['name', 'email'], // fields in contracts table
      },
    );

    return {
      ...response,
      data: response.data.map((supplier) =>
        SupplierResponseDto.fromSupplier(supplier),
      ),
    };
  }

  async findOne(id: string): Promise<SupplierResponseDto> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return SupplierResponseDto.fromSupplier(supplier);
  }

  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // Update regular fields
    Object.assign(supplier, {
      name: updateSupplierDto.name,
      email: updateSupplierDto.email,
      phone: updateSupplierDto.phone,
      dateOfBirth: updateSupplierDto.dateOfBirth,
    });

    return this.supplierRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    await this.supplierRepository.delete(id);
  }

  async findByEmail(email: string): Promise<Supplier | undefined> {
    return this.supplierRepository.findOne({
      where: { email },
    });
  }
}
