// licences/dto/licence-response.dto.ts
import { Expose } from 'class-transformer';
import { Party } from '../entities/party.entity';

export class PartyResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  fileUrl: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromParty(party: Party): PartyResponseDto {
    const dto = new PartyResponseDto();
    dto.id = party.id;
    dto.name = party.name;
    dto.email = party.email;
    dto.phone = party.phone;
    dto.description = party.description;
    dto.description = party.description;
    dto.status = party.status;
    const baseUrl = process.env.baseUrl ?? 'http://localhost:8001'; // Your production base URL
    dto.fileUrl = party.fileUrl ? `${baseUrl}${party.fileUrl}` : '';
    return dto;
  }
}
