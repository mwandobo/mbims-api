import { Injectable, Logger } from '@nestjs/common';
import { UserApproval } from '../entities/user-approval.entity';
import { ApprovalActionEnum } from '../enums/approval-action.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprovalAction } from '../entities/approval-action.entity';
import { In, Repository } from 'typeorm';
import { SysApproval } from '../entities/system-approval.entity';
import { ApprovalLevel } from '../entities/approval-level.entity';

@Injectable()
export class ApprovalStatusUtil {
  private readonly logger = new Logger(ApprovalStatusUtil.name);

  constructor(
    @InjectRepository(SysApproval)
    private readonly sysApprovalRepository: Repository<SysApproval>,

    @InjectRepository(UserApproval)
    private readonly userApprovalRepository: Repository<UserApproval>,

    @InjectRepository(ApprovalLevel)
    private readonly approvalLevelRepository: Repository<ApprovalLevel>,

    @InjectRepository(ApprovalAction)
    private readonly approvalActionRepository: Repository<ApprovalAction>,
  ) {}

  /**
   * Check if an entity has approval mode enabled
   * (it has a SysApproval, UserApproval, and at least one level)
   */
  async hasApprovalMode(entityName: string): Promise<boolean> {
    this.logger.debug(`Checking if ${entityName} has approval mode...`);

    const sys = await this.sysApprovalRepository.findOne({
      where: { entityName },
    });
    if (!sys) {
      this.logger.debug(`No SysApproval found for entity ${entityName}`);
      return false;
    }

    const userApproval = await this.userApprovalRepository.findOne({
      where: { sysApproval: { id: sys.id } },
    });
    if (!userApproval) {
      this.logger.debug(`No UserApproval found for SysApproval ${sys.id}`);
      return false;
    }

    const levels = await this.approvalLevelRepository.find({
      where: { userApproval: { id: userApproval.id } },
    });
    this.logger.debug(
      `${levels.length} approval levels found for entity ${entityName}`,
    );

    return levels.length > 0;
  }

  /**
   * Determine approval status for a given entity.
   * Rules:
   * - REJECTED: if any level has a REJECTED action.
   * - PENDING: if any level is missing approval or not yet acted on.
   * - APPROVED: only if all levels are approved.
   */
  async getApprovalStatus(
    entityName: string,
    entityId: string,
  ): Promise<'PENDING' | 'APPROVED' | 'REJECTED'> {
    this.logger.debug(
      `\n📄 Checking approval status for ${entityName} (ID: ${entityId})`,
    );

    const userApproval = await this.getUserApproval(entityName);
    if (!userApproval) {
      this.logger.debug(
        `No UserApproval found for entity ${entityName} → returning PENDING`,
      );
      return 'PENDING';
    }


    const levels = await this.approvalLevelRepository.find({
      where: { userApproval: { id: userApproval.id } },
    });


    this.logger.debug(
      `Found ${levels.length} approval levels for entity ${entityName}`,
    );

    if (levels.length === 0) {
      this.logger.debug('No approval levels found → returning PENDING');
      return 'PENDING';
    }

    const actions = await this.approvalActionRepository.find({
      where: { entityName, entityId },
      relations: ['approvalLevel'],
    });

    this.logger.debug(
      `Found ${actions.length} approval actions for entity ${entityName}`,
    );

    if (actions.length === 0) {
      this.logger.debug('No approval actions yet → returning PENDING');
      return 'PENDING';
    }

    for (const level of levels) {
      const levelActions = actions.filter(
        (a) => a.approvalLevel.id === level.id,
      );

      this.logger.debug(
        `Level ${level.id} → ${levelActions.length} actions: ${levelActions
          .map((a) => a.action)
          .join(', ')}`,
      );

      if (levelActions.length === 0) {
        this.logger.debug(
          `No actions found for level ${level.id} → returning PENDING`,
        );
        return 'PENDING';
      }

      if (levelActions.some((a) => a.action === ApprovalActionEnum.REJECTED)) {
        this.logger.debug(
          `Level ${level.id} contains REJECTED → returning REJECTED`,
        );
        return 'REJECTED';
      }

      if (!levelActions.some((a) => a.action === ApprovalActionEnum.APPROVED)) {
        this.logger.debug(
          `Level ${level.id} not yet approved → returning PENDING`,
        );
        return 'PENDING';
      }
    }

    this.logger.debug(
      `✅ All levels approved for ${entityName} → returning APPROVED`,
    );
    return 'APPROVED';
  }

  private async getUserApproval(
    entityName: string,
  ): Promise<UserApproval | null> {
    this.logger.debug(`Fetching UserApproval for entity ${entityName}...`);

    const sys = await this.sysApprovalRepository.findOne({
      where: { entityName },
    });
    if (!sys) {
      this.logger.debug(`No SysApproval found for entity ${entityName}`);
      return null;
    }

    const userApproval = await this.userApprovalRepository.findOne({
      where: { sysApproval: { id: sys.id } },
    });

    if (!userApproval) {
      this.logger.debug(`No UserApproval found for SysApproval ID: ${sys.id}`);
      return null;
    }

    this.logger.debug(
      `✅ Found UserApproval ID: ${userApproval.id} for ${entityName}`,
    );
    return userApproval;
  }

  async getBulkApprovalStatuses(
    entityName: string,
    entityIds: string[],
  ): Promise<Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'>> {
    const statuses: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'> = {};

    // Fetch related setup
    const userApproval = await this.getUserApproval(entityName);
    if (!userApproval) {
      entityIds.forEach((id) => (statuses[id] = 'PENDING'));
      return statuses;
    }

    const levels = await this.approvalLevelRepository.find({
      where: { userApproval: { id: userApproval.id } },
    });

    if (levels.length === 0) {
      entityIds.forEach((id) => (statuses[id] = 'PENDING'));
      return statuses;
    }

    // Fetch all actions in one go
    const actions = await this.approvalActionRepository.find({
      where: { entityName, entityId: In(entityIds) },
      relations: ['approvalLevel'],
    });

    // Group actions by entityId
    const actionsByEntity: Record<string, ApprovalAction[]> = {};
    actions.forEach((action) => {
      if (!actionsByEntity[action.entityId]) actionsByEntity[action.entityId] = [];
      actionsByEntity[action.entityId].push(action);
    });

    // Determine status for each entity
    for (const entityId of entityIds) {
      const entityActions = actionsByEntity[entityId] || [];
      if (entityActions.length === 0) {
        statuses[entityId] = 'PENDING';
        continue;
      }

      let rejected = false;
      let pending = false;

      for (const level of levels) {
        const levelActions = entityActions.filter(
          (a) => a.approvalLevel.id === level.id,
        );

        if (levelActions.some((a) => a.action === 'REJECTED')) {
          rejected = true;
          break;
        }

        if (!levelActions.some((a) => a.action === 'APPROVED')) {
          pending = true;
        }
      }

      if (rejected) statuses[entityId] = 'REJECTED';
      else if (pending) statuses[entityId] = 'PENDING';
      else statuses[entityId] = 'APPROVED';
    }

    return statuses;
  }

  async getUserApprovall(entityName: string) {
    const sys = await this.sysApprovalRepository.findOne({ where: { entityName } });
    if (!sys) return null;
    return this.userApprovalRepository.findOne({
      where: { sysApproval: { id: sys.id } },
    });
  }

  async getLevelsByUserApproval(userApprovalId: string) {
    return this.approvalLevelRepository.find({
      where: { userApproval: { id: userApprovalId } },
    });
  }

  async getActions(entityName: string, entityId: string) {
    return this.approvalActionRepository.find({
      where: { entityName, entityId },
      relations: ['approvalLevel'],
    });
  }


}
