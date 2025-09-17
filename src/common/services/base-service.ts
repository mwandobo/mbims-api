import { Repository } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from '../dtos/pagination.dto';

export abstract class BaseService<T> {
  constructor(protected repository: Repository<T>) {}

  async findAllPaginated(
    pagination: PaginationDto,
    relations: string[] = [],
    searchConfig: { fields: string[]; relations?: Record<string, string[]> } = {
      fields: [],
      relations: {},
    },
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit, q } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('entity')
      .take(limit)
      .skip(skip);

    // Add relations
    relations.forEach((relation) => {
      queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
    });

    // Add search if query and fields provided
    if (
      q &&
      (searchConfig.fields.length > 0 ||
        Object.keys(searchConfig.relations || {}).length > 0)
    ) {
      const whereConditions = [];

      // Search in main entity fields
      if (searchConfig.fields.length > 0) {
        whereConditions.push(
          searchConfig.fields
            .map((field) => `LOWER(entity.${field}) LIKE LOWER(:query)`)
            .join(' OR '),
        );
      }

      // Search in related entities
      if (searchConfig.relations) {
        for (const [relation, fields] of Object.entries(
          searchConfig.relations,
        )) {
          fields.forEach((field) => {
            whereConditions.push(
              `LOWER(${relation}.${field}) LIKE LOWER(:query)`,
            );
          });
        }
      }

      queryBuilder.where(whereConditions.join(' OR '), { query: `%${q}%` });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponseDto(data, total, pagination);
  }
}
