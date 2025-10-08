import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysApproval } from './entities/system-approval.entity';
import { SysApprovalController } from './controller/sys-approvals.controller';
import { SysApprovalService } from './service/sys-approval.service';
import { SysApprovalSeederService } from './seeder/sys-approvals.seeder';
import { UserApprovalService } from './service/user-approval.service';
import { UserApprovalController } from './controller/user-approval.controller';
import { UserApproval } from './entities/user-approval.entity';
import { ApprovalLevelController } from './controller/approval-level.controller';
import { ApprovalLevel } from './entities/approval-level.entity';
import { ApprovalLevelService } from './service/approval-level.service';
import { Role } from '../../admnistration/roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { ApprovalActionService } from './service/approval-action.service';
import { ApprovalActionController } from './controller/approval-action.controller';
import { ApprovalAction } from './entities/approval-action.entity';
import { ApprovalStatusUtil } from './utils/approval-status.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SysApproval,
      UserApproval,
      ApprovalLevel,
      Role,
      User,
      ApprovalAction
    ]),
  ], // must import the entity here
  controllers: [
    SysApprovalController,
    UserApprovalController,
    ApprovalLevelController,
    ApprovalActionController
  ],
  providers: [
    SysApprovalService,
    SysApprovalSeederService,
    UserApprovalService,
    ApprovalLevelService,
    ApprovalActionService,
    ApprovalStatusUtil
  ],
  exports: [
    SysApprovalService,
    SysApprovalSeederService,
    UserApprovalService,
    ApprovalLevelService,
    ApprovalActionService,
    ApprovalStatusUtil
  ],
  // exports: [SysApprovalService],
})
export class ApprovalsModule {}
