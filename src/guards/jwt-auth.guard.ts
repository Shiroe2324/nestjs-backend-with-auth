import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { I18nContext } from 'nestjs-i18n';

import { Strategies } from '@/enums/strategies.enum';
import { I18nTranslations } from '@/generated/i18n.generated';

@Injectable()
export class JwtAuthGuard extends AuthGuard(Strategies.JWT) {
  public handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    const i18n = I18nContext.current<I18nTranslations>();
    if (err || !user) throw new UnauthorizedException(i18n.t('guard.jwt.invalid'));
    return user;
  }
}
