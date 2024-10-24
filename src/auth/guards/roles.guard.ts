import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/roles.decorator';
import { RoleEnum, RoleHierarchy } from 'src/users/enums/enums';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<RoleEnum>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const { user } = context.switchToHttp().getRequest();
    if (!requiredRole || !user) {
      console.log(user);
      console.log(requiredRole);

      return true;
    }
    const userRoles = RoleHierarchy[user.role.name];

    return userRoles.includes(requiredRole);
  }
}
