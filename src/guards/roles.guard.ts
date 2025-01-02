import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';

import { RequiredRoles } from '@/decorators/roles.decorator';
import { I18nTranslations } from '@/generated/i18n.generated';
import { matchRoles } from '@/utils/match-roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.get(RequiredRoles, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const hasRole = matchRoles(requiredRoles, user.roles);
    const i18n = I18nContext.current<I18nTranslations>();

    if (!hasRole) {
      const message = i18n ? i18n.t('guards.roles.forbidden', { args: { roles: requiredRoles.join(', ') } }) : 'Forbidden';
      throw new ForbiddenException(message);
    }

    return true;
  }
}
