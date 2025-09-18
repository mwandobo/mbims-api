import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { ActivityLoggerInterceptor } from './common/interceptors/activity-logger.interceptor';
import { ActivityService } from './common/activity-logs/activity-logs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT ?? 8000;

  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  const activityService = app.get(ActivityService);
  app.useGlobalInterceptors(new ActivityLoggerInterceptor(activityService));

  await app.listen(port);

  logger.log(`🚀 Server is running on http://localhost:${port}`);
}
bootstrap();
