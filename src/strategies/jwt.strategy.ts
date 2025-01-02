import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { TokenBlacklist } from '@/entities/token-blacklist.entity';
import { User } from '@/entities/user.entity';
import { Strategies } from '@/enums/strategies.enum';
import { AuthJwtPayload } from '@/types/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, Strategies.JWT) {
  static readonly cookieExtractor = (req: Request) => req.cookies['accessToken'];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: JwtStrategy.cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  public async validate(payload: AuthJwtPayload) {
    const isTokenBlacklisted = await this.tokenBlacklistRepository.findOneBy({ token: payload.jti });
    if (isTokenBlacklisted) return null;

    return await this.userRepository.findOne({ where: { id: parseInt(payload.sub, 10) }, relations: { roles: true } });
  }
}
