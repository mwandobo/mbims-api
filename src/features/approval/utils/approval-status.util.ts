import { Injectable } from '@nestjs/common';
import { UserApproval } from '../entities/user-approval.entity';
import { ApprovalActionEnum } from '../enums/approval-action.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprovalAction } from '../entities/approval-action.entity';
import { Repository } from 'typeorm';
import { SysApproval } from '../entities/system-approval.entity';
import { ApprovalLevel } from '../entities/approval-level.entity';

@Injectable()
export class ApprovalStatusUtil {
  constructor(
    @InjectRepository(SysApproval)
    private readonly sysApprovalRepository: Repository<SysApproval>,
    @InjectRepository(SysApproval)
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
    const sys = await this.sysApprovalRepository.findOne({
      where: { entityName },
    });
    if (!sys) return false;

    const userApproval = await this.userApprovalRepository.findOne({
      where: { sysApproval: { id: sys.id } },
    });
    if (!userApproval) return false;

    const levels = await this.approvalLevelRepository.find({
      where: { userApproval },
    });
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
    const userApproval = await this.getUserApproval(entityName);
    if (!userApproval) return 'PENDING';

    const levels = await this.approvalLevelRepository.find({
      where: { userApproval },
    });
    if (levels.length === 0) return 'PENDING';

    const actions = await this.approvalActionRepository.find({
      where: { entityName, entityId },
      relations: ['approvalLevel'],
    });

    if (actions.length === 0) return 'PENDING';

    for (const level of levels) {
      const levelActions = actions.filter(
        (a) => a.approvalLevel.id === level.id,
      );

      if (levelActions.length === 0) return 'PENDING';
      if (levelActions.some((a) => a.action === ApprovalActionEnum.REJECTED))
        return 'REJECTED';
      if (!levelActions.some((a) => a.action === ApprovalActionEnum.APPROVED))
        return 'PENDING';
    }

    return 'APPROVED';
  }

  private async getUserApproval(
    entityName: string,
  ): Promise<UserApproval | null> {
    const sys = await this.sysApprovalRepository.findOne({
      where: { entityName },
    });
    if (!sys) return null;

    const userApproval = await this.userApprovalRepository.findOne({
      where: { sysApproval: { id: sys.id } },
    });
    return userApproval ?? null;
  }
}
