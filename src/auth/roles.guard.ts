import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';
import { AuthPayload } from './auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ payload: AuthPayload }>();
    const { payload } = request;

    const hasRole = requiredRoles.some((role) => payload.userType === role);

    if (hasRole) {
      return true;
    }

    throw new ForbiddenException('Você não tem permissão para acessar este recurso.');
  }
}
