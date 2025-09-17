// src/interceptors/activity-logger.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ActivityService } from '../activity-logs/activity-logs.service';

@Injectable()
export class ActivityLoggerInterceptor implements NestInterceptor {
  constructor(private readonly activityService: ActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (method === 'GET') {
      return next.handle();
    }

    const user = request.user || {};
    const endpoint = request.originalUrl;
    const ip =
      request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const body = request.body;
    const username = user.username || user.email || 'Unknown User';

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        this.activityService.create({
          user: username,
          method,
          endpoint,
          activity: `Called ${method} ${endpoint}`,
          ip,
          data: JSON.stringify(body),
          duration,
        });
      }),
    );
  }
}
