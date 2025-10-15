import { Repository, In } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from '../dtos/pagination.dto';
import { ApprovalStatusUtil } from '../../features/approval/utils/approval-status.util';

export abstract class BaseService<T> {
  constructor(
    protected repository: Repository<T>,
    private readonly approvalStatusUtil?: ApprovalStatusUtil, // optional DI
    private readonly approvalSlug?: string,
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
    const hasApprovalMode =
      this.approvalSlug &&
      (await this.approvalStatusUtil.hasApprovalMode(this.approvalSlug));

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
        this.approvalSlug,
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

  // protected async attachApprovalInfo<T extends { id: string }>(
  //   entity: T,
  //   entityName: string,
  // ): Promise<T & { hasApprovalMode: boolean; approvalStatus: string }> {
  //   if (!this.approvalStatusUtil) {
  //     return { ...entity, hasApprovalMode: false, approvalStatus: 'N/A' };
  //   }
  //
  //   const [hasApprovalMode, approvalStatus] = await Promise.all([
  //     this.approvalStatusUtil.hasApprovalMode(entityName),
  //     this.approvalStatusUtil.getApprovalStatus(entityName, entity.id),
  //   ]);
  //
  //   return { ...entity, hasApprovalMode, approvalStatus };
  // }

  protected async attachApprovalInfo<T extends { id: string }>(
    entity: T,
    entityName: string,
    userRoleId?: string, // 👈 pass the logged-in user’s roleId here
  ): Promise<
    T & {
      hasApprovalMode: boolean;
      approvalStatus: string;
      isMyLevelApproved: boolean;
      shouldApprove: boolean;
    }
  > {
    if (!this.approvalStatusUtil) {
      return {
        ...entity,
        hasApprovalMode: false,
        approvalStatus: 'N/A',
        isMyLevelApproved: false,
        shouldApprove: false,
      };
    }

    // 🧠 Load all needed data in parallel
    const [hasApprovalMode, approvalStatus] = await Promise.all([
      this.approvalStatusUtil.hasApprovalMode(entityName),
      this.approvalStatusUtil.getApprovalStatus(entityName, entity.id),
    ]);

    if (!hasApprovalMode || approvalStatus === 'REJECTED') {
      return {
        ...entity,
        hasApprovalMode,
        approvalStatus,
        isMyLevelApproved: false,
        shouldApprove: false,
      };
    }

    // 🧩 Fetch approval details for logic below
    const userApproval =
      await this.approvalStatusUtil.getUserApprovall(entityName);
    if (!userApproval) {
      return {
        ...entity,
        hasApprovalMode,
        approvalStatus,
        isMyLevelApproved: false,
        shouldApprove: false,
      };
    }

    const levels = await this.approvalStatusUtil.getLevelsByUserApproval(
      userApproval.id,
    );
    const actions = await this.approvalStatusUtil.getActions(
      entityName,
      entity.id,
    );

    // 🔍 Determine if the user’s level is approved
    let isMyLevelApproved = false;
    let shouldApprove = false;

    const myLevel = levels.find((level) => level.role.id === userRoleId);

    if (myLevel) {
      const myActions = actions.filter(
        (a) => a.approvalLevel.id === myLevel.id,
      );
      isMyLevelApproved = myActions.some((a) => a.action === 'APPROVED');
    }

    // ⚙️ Determine if user *should approve*
    // if (approvalStatus === 'PENDING' && myLevel && !isMyLevelApproved) {
    //   // Check if all previous levels are approved
    //   const previousLevels = levels.filter(
    //     (lvl) => lvl.levelOrder < myLevel.levelOrder,
    //   );
    //
    //   const allPrevApproved = previousLevels.every((lvl) =>
    //     actions.some(
    //       (a) => a.approvalLevel.id === lvl.id && a.action === 'APPROVED',
    //     ),
    //   );
    //
    //   shouldApprove = allPrevApproved;
    // }

    if (approvalStatus === 'PENDING' && myLevel && !isMyLevelApproved) {
      // ✅ Check if all previous levels (by createdAt) are approved
      const previousLevels = levels.filter(
        (lvl) => new Date(lvl.createdAt) < new Date(myLevel.createdAt),
      );

      const allPrevApproved = previousLevels.every((lvl) =>
        actions.some(
          (a) => a.approvalLevel.id === lvl.id && a.action === 'APPROVED',
        ),
      );

      shouldApprove = allPrevApproved;
    }


    return {
      ...entity,
      hasApprovalMode,
      approvalStatus,
      isMyLevelApproved,
      shouldApprove,
    };
  }
}
