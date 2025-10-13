// src/database/seeders/sys-approval.seeder.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysApproval } from '../entities/system-approval.entity';

@Injectable()
export class SysApprovalSeederService implements OnModuleInit {
  constructor(
    @InjectRepository(SysApproval)
    private readonly sysApprovalRepository: Repository<SysApproval>,
  ) {}

  async onModuleInit() {
    await this.seedSysApprovals();
  }


  private async seedSysApprovals(): Promise<void> {
    const approvals = [
      {
        name: 'User Approval',
        description: 'Handles User approvals',
        entityName: 'User',
      },
      {
        name: 'Department Approval',
        description: 'Handles User approvals',
        entityName: 'Department',
      },
      {
        name: 'Asset Request Approval',
        description: 'Handles Asset Requests approvals',
        entityName: 'AssetRequest',
      },
    ];

    for (const approval of approvals) {
      const existing = await this.sysApprovalRepository.findOne({
        where: { name: approval.name },
      });

      if (!existing) {
        await this.sysApprovalRepository.save(
          this.sysApprovalRepository.create(approval),
        );
        console.log(`✅ Added new system approval: ${approval.name}`);
      } else {
        console.log(`ℹ️ Approval already exists: ${approval.name}`);
      }
    }

    console.log('🎉 SysApproval seeding completed.');
  }

}
