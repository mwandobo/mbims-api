// contracts/dto/contract-response.dto.ts
import { Expose } from 'class-transformer';

export class ContractStatsDto {
  @Expose()
  total: number;

  @Expose()
  pending: number;

  @Expose()
  ongoing: number;

  @Expose()
  completed: number;

  @Expose()
  closed: number;

}