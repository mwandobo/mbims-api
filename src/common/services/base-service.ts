import { Repository, In } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from '../dtos/pagination.dto';
import { ApprovalStatusUtil } from '../../features/approval/utils/approval-status.util';

export abstract class BaseService<T> {
  constructor(
    protected repository: Repository<T>,
    private readonly approvalStatusUtil?: ApprovalStatusUtil, // optional DI
  ) {}

  async findAllPaginated(
    pagination: PaginationDto,
    relations: string[] = [],
    searchConfig: { fields: string[]; relations?: Record<string, string[]> } = {
      fields: [],
      relations: {},
    },
    filters: Record<string, any> = {},
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit, q } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('entity')
      .take(limit)
      .skip(skip);

    const joinedAliases = new Set<string>();

    // 🧩 Join relations
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

    // 🔍 Search logic
    if (
      q &&
      (searchConfig.fields.length > 0 ||
        Object.keys(searchConfig.relations || {}).length > 0)
    ) {
      const whereConditions = [];
      if (searchConfig.fields.length > 0) {
        whereConditions.push(
          searchConfig.fields
            .map((field) => `LOWER(entity.${field}) LIKE LOWER(:query)`)
            .join(' OR '),
        );
      }

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

    // 🎯 Filter logic
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
      }
    }

    // 🧱 Get data and total
    const [data, total] = await queryBuilder.getManyAndCount();

    // 🟡 If no approval util, just return data with N/A
    if (!this.approvalStatusUtil) {
      const dataWithNA = data.map((entity: any) => ({
        ...entity,
        approvalStatus: 'N/A',
      }));
      return new PaginatedResponseDto(dataWithNA, total, pagination);
    }

    // 🧠 Check approval mode once per entity type
    const entityName = this.repository.metadata.name;
    const hasApprovalMode =
      await this.approvalStatusUtil.hasApprovalMode(entityName);

    if (!hasApprovalMode) {
      const dataWithNA = data.map((entity: any) => ({
        ...entity,
        approvalStatus: 'N/A',
      }));
      return new PaginatedResponseDto(
        dataWithNA,
        total,
        pagination,
        hasApprovalMode,
      );
    }

    // 🧩 Fetch approval statuses in bulk
    const entityIds = data.map((entity: any) => entity.id);
    const approvalStatuses =
      await this.approvalStatusUtil.getBulkApprovalStatuses(
        entityName,
        entityIds,
      );

    const dataWithApproval = data.map((entity: any) => ({
      ...entity,
      approvalStatus: approvalStatuses[entity.id] ?? 'PENDING',
    }));

    return new PaginatedResponseDto(
      dataWithApproval,
      total,
      pagination,
      hasApprovalMode,
    );
  }
}
