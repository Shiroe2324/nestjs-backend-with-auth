import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Strategies } from '@/enums/strategies.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard(Strategies.JWT) {
  public handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    if (err || !user) throw new UnauthorizedException('No hay una sesión activa');
    return user;
  }
}
