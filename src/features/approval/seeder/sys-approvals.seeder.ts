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

  // private async seedSysApprovals(): Promise<void> {
  //   const approvals = [
  //     { name: 'Finance Approval', description: 'Handles financial approvals' },
  //     {
  //       name: 'Procurement Approval',
  //       description: 'Handles procurement processes',
  //     },
  //     { name: 'HR Approval', description: 'Handles HR-related approvals' },
  //     {
  //       name: 'Admin Approval',
  //       description: 'Handles administrative approvals',
  //     },
  //     {
  //       name: 'ICT Approval',
  //       description: 'Handles IT and systems-related approvals',
  //     },
  //   ];
  //
  //   for (const approval of approvals) {
  //     const existing = await this.sysApprovalRepository.findOne({
  //       where: { name: approval.name },
  //     });
  //
  //     if (!existing) {
  //       await this.sysApprovalRepository.save(
  //         this.sysApprovalRepository.create(approval),
  //       );
  //       console.log(`✅ Added new system approval: ${approval.name}`);
  //     } else {
  //       console.log(`ℹ️ Approval already exists: ${approval.name}`);
  //     }
  //   }
  //
  //   console.log('🎉 SysApproval seeding completed.');
  // }

  private async seedSysApprovals(): Promise<void> {
    const approvals = [
      {
        name: 'User Approval',
        description: 'Handles User approvals',
        entityName: 'User',
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
