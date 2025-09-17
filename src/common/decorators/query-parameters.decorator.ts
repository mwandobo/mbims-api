import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationDto } from '../dtos/pagination.dto';

export const QueryParameter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { action = '', id = null,} = request.query;

    return {
      action: action,
      id: id,
    };
  },
);