// contracts/excel-comparison.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Contract } from '../contracts/entities/contracts.entity';
import { Licence } from '../lincence/entities/licence.entity';
import { Policy } from '../policy/entities/policy.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
    @InjectRepository(Licence)
    private readonly licenceRepository: Repository<Licence>,
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
  ) {}

  async getContractsStats() {
    const now = new Date();

    const thirtyDaysFromNow = new Date(
      now.setDate(now.getDate() + 30),
    ).toISOString();

    const [
      totalContracts,
      activeContracts,
      expiringSoonContracts,
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      totalPolicies,
      activePolicies,
      expiredPolicies,
    ] = await Promise.all([
      this.contractsRepository.count(),
      this.contractsRepository.count({ where: { status: 'pending' } }),
      this.contractsRepository.count({
        where: {
          status: 'active',
          endDate: LessThan(thirtyDaysFromNow),
        },
      }),
      this.licenceRepository.count(),
      this.licenceRepository.count({ where: { status: 'pending' } }),
      this.licenceRepository.count({ where: { status: 'expired' } }),

      this.policyRepository.count(),
      this.policyRepository.count({ where: { status: 'pending' } }),
      this.policyRepository.count({ where: { status: 'expired' } }),
    ]);

    return {
      total_contracts: totalContracts,
      activeContracts,
      expiringSoon: expiringSoonContracts,
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      totalPolicies,
      activePolicies,
      expiredPolicies,
    };
  }

}
