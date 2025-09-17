// src/database/database.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { DatabaseOptions } from './interfaces/database-options.interface';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_OPTIONS') private options: DatabaseOptions,
    private dataSource: DataSource,
  ) {}

  async testConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}