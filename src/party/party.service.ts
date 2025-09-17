import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CreatePartyDto } from './dtos/create-party.dto';
import { UpdatePartyDto } from './dtos/update-party.dto';
import { PartyResponseDto } from './dtos/party-response.dto';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../common/dtos/pagination.dto';
import { BaseService } from '../common/services/base-service';
import { Party } from './entities/party.entity';

@Injectable()
export class PartyService extends BaseService<Party> {
  private readonly UPLOAD_PATH = 'uploads/parties';

  constructor(
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
  ) {
    super(partyRepository);
    this.ensureUploadDirectoryExists();
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<PartyResponseDto>> {
    const response = await this.findAllPaginated(
      pagination,
      [], // relations
      {
        fields: ['name', 'title', 'description']
      },
    );

    return {
      ...response,
      data: response.data.map((party) =>
        PartyResponseDto.fromParty(party),
      ),
    };
  }

  async create(
    createPartyDto: CreatePartyDto,
    file?: Express.Multer.File,
  ): Promise<Party> {
    const fileUrl = file ? await this.saveUploadedFile(file) : null;
    const party = this.partyRepository.create({
      ...createPartyDto,
      fileUrl,
    });

    return this.partyRepository.save(party);
  }

  async update(
    id: string,
    updatePartyDto: UpdatePartyDto,
  ): Promise<Party> {
    const party = await this.findById(id);
    Object.assign(party, updatePartyDto);
    return this.partyRepository.save(party);
  }

  async findOne(id: string): Promise<PartyResponseDto> {
    const party = await this.findById(id);
    return PartyResponseDto.fromParty(party);
  }

  async delete(id: string): Promise<void> {
    const result = await this.partyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Party with ID ${id} not found`);
    }
  }

  private async findById(
    id: string,
    relations: string[] = [],
  ): Promise<Party> {
    const party = await this.partyRepository.findOne({
      where: { id },
      relations,
    });

    if (!party) {
      throw new NotFoundException(`Party with ID ${id} not found`);
    }
    return party;
  }

  private async saveUploadedFile(
    file?: Express.Multer.File, // This is the correct usage
  ): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const fullPath = path.join(this.UPLOAD_PATH, filename);
    await fs.promises.writeFile(fullPath, file.buffer);
    return `/uploads/parties/${filename}`;
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.UPLOAD_PATH)) {
      fs.mkdirSync(this.UPLOAD_PATH, { recursive: true });
    }
  }
}
