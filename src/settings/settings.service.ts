// settings/settings.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepo: Repository<Setting>
  ) {}

  async get(key: string): Promise<string> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    return setting?.value || '';
  }

  async set(key: string, value: string) {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      return this.settingsRepo.save(setting);
    }
    return this.settingsRepo.save({ key, value });
  }
}
