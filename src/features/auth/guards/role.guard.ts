// roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles) {
      return true; // No roles specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User in RolesGuard:', user); // Debug log

    // if (!user?.roles) {
    //   throw new ForbiddenException('No roles assigned');
    // }
    //
    // // Changed this line - removed .name since roles are strings
    // const hasRole = user.roles.some(role => requiredRoles.includes(role));
    //
    // if (!hasRole) {
    //   throw new ForbiddenException('Insufficient permissions');
    // }

    return true;
  }
}