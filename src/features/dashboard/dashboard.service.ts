// contracts/excel-comparison.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Contract } from '../contracts/entities/contracts.entity';
import { Licence } from '../lincence/entities/licence.entity';
import { Policy } from '../policy/entities/policy.entity';
import { AssetCategoryEntity } from '../assets-management/asset-category/asset-category.entity';
import { AssetEntity } from '../assets-management/asset/asset.entity';
import { AssetRequestEntity } from '../assets-management/asset-request/entity/asset-request.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(AssetCategoryEntity)
    private readonly assetCategoryRepository: Repository<AssetCategoryEntity>,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(AssetRequestEntity)
    private readonly assetRequestRepository: Repository<AssetRequestEntity>,
  ) {}

  async getOverallStats() {
    const [totalAssetCategories, totalAssets, totalAssetRequests] =
      await Promise.all([
        this.assetCategoryRepository.count(),
        this.assetRepository.count(),
        this.assetRequestRepository.count(),
      ]);

    return {
      totalAssetCategories,
      totalAssets,
      totalAssetRequests,
    };
  }
}
