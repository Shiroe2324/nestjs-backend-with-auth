import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Strategies } from '@/enums/strategies.enum';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(Strategies.GOOGLE) {
  constructor() {
    super({ accessType: 'offline' });
  }
}
