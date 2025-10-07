import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysApproval } from './entities/system-approval.entity';
import { SysApprovalController } from './controller/sys-approvals.controller';
import { SysApprovalService } from './service/sysy-approval.service';
import { SysApprovalSeederService } from './seeder/sys-approvals.seeder';
import { UserApprovalService } from './service/user-approval.service';
import { UserApprovalController } from './controller/user-approval.controller';
import { UserApproval } from './entities/user-approval.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysApproval, UserApproval])], // must import the entity here
  controllers: [SysApprovalController, UserApprovalController],
  providers: [
    SysApprovalService,
    SysApprovalSeederService,
    UserApprovalService,
  ],
  exports: [SysApprovalService],
})
export class ApprovalsModule {}
