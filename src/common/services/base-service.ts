import { Repository } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from '../dtos/pagination.dto';

export abstract class BaseService<T> {
  constructor(protected repository: Repository<T>) {}

  // async findAllPaginated(
  //   pagination: PaginationDto,
  //   relations: string[] = [],
  //   searchConfig: { fields: string[]; relations?: Record<string, string[]> } = {
  //     fields: [],
  //     relations: {},
  //   },
  // ): Promise<PaginatedResponseDto<any>> {
  //   const { page, limit, q } = pagination;
  //   const skip = (page - 1) * limit;
  //
  //   const queryBuilder = this.repository
  //     .createQueryBuilder('entity')
  //     .take(limit)
  //     .skip(skip);
  //
  //   // Add relations
  //   // relations.forEach((relation) => {
  //   //   queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
  //   // });
  //
  //   // relations.forEach((relation) => {
  //   //   const parts = relation.split('.');
  //   //   let parentAlias = 'entity';
  //   //
  //   //   parts.forEach((part, index) => {
  //   //     const alias = parts.slice(0, index + 1).join('_'); // e.g., items_asset
  //   //     queryBuilder.leftJoinAndSelect(`${parentAlias}.${part}`, alias);
  //   //     parentAlias = alias;
  //   //   });
  //   // });
  //
  //
  //   const joinedAliases = new Set<string>();
  //
  //   relations.forEach((relation) => {
  //     const parts = relation.split('.');
  //     let parentAlias = 'entity';
  //
  //     parts.forEach((part, index) => {
  //       const alias = parts.slice(0, index + 1).join('_'); // e.g., items_asset
  //
  //       if (!joinedAliases.has(alias)) {
  //         queryBuilder.leftJoinAndSelect(`${parentAlias}.${part}`, alias);
  //         joinedAliases.add(alias);
  //       }
  //
  //       parentAlias = alias;
  //     });
  //   });
  //
  //
  //
  //   // Add search if query and fields provided
  //   if (
  //     q &&
  //     (searchConfig.fields.length > 0 ||
  //       Object.keys(searchConfig.relations || {}).length > 0)
  //   ) {
  //     const whereConditions = [];
  //
  //     // Search in main entity fields
  //     if (searchConfig.fields.length > 0) {
  //       whereConditions.push(
  //         searchConfig.fields
  //           .map((field) => `LOWER(entity.${field}) LIKE LOWER(:query)`)
  //           .join(' OR '),
  //       );
  //     }
  //
  //     // Search in related entities
  //     if (searchConfig.relations) {
  //       for (const [relation, fields] of Object.entries(
  //         searchConfig.relations,
  //       )) {
  //         fields.forEach((field) => {
  //           whereConditions.push(
  //             `LOWER(${relation}.${field}) LIKE LOWER(:query)`,
  //           );
  //         });
  //       }
  //     }
  //
  //     queryBuilder.where(whereConditions.join(' OR '), { query: `%${q}%` });
  //   }
  //
  //   const [data, total] = await queryBuilder.getManyAndCount();
  //
  //   return new PaginatedResponseDto(data, total, pagination);
  // }


  async findAllPaginated(
    pagination: PaginationDto,
    relations: string[] = [],
    searchConfig: { fields: string[]; relations?: Record<string, string[]> } = {
      fields: [],
      relations: {},
    },
    filters: Record<string, any> = {}, // <-- new param
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit, q } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('entity')
      .take(limit)
      .skip(skip);

    const joinedAliases = new Set<string>();

    relations.forEach((relation) => {
      const parts = relation.split('.');
      let parentAlias = 'entity';
      parts.forEach((part, index) => {
        const alias = parts.slice(0, index + 1).join('_');
        if (!joinedAliases.has(alias)) {
          queryBuilder.leftJoinAndSelect(`${parentAlias}.${part}`, alias);
          joinedAliases.add(alias);
        }
        parentAlias = alias;
      });
    });

    // 🔍 Search logic (keep as is)
    if (q && (searchConfig.fields.length > 0 || Object.keys(searchConfig.relations || {}).length > 0)) {
      const whereConditions = [];
      if (searchConfig.fields.length > 0) {
        whereConditions.push(
          searchConfig.fields.map((field) => `LOWER(entity.${field}) LIKE LOWER(:query)`).join(' OR '),
        );
      }

      if (searchConfig.relations) {
        for (const [relation, fields] of Object.entries(searchConfig.relations)) {
          fields.forEach((field) => {
            whereConditions.push(`LOWER(${relation}.${field}) LIKE LOWER(:query)`);
          });
        }
      }

      queryBuilder.where(whereConditions.join(' OR '), { query: `%${q}%` });
    }

    // 🎯 Filter logic (new)
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      }
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return new PaginatedResponseDto(data, total, pagination);
  }

}
