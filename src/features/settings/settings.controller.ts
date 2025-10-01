// settings/settings.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('cron')
  async getCron() {
    const cron = await this.settingsService.get('cron_schedule');
    return { cron };
  }

  @Post('cron')
  async updateCron(@Body('cron') cron: string) {
    await this.settingsService.set('cron_schedule', cron);
    return { success: true };
  }
}
