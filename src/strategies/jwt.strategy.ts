import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { Token } from '@/entities/token.entity';
import { User } from '@/entities/user.entity';
import { Strategies } from '@/enums/strategies.enum';
import { AuthJwtPayload } from '@/types/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, Strategies.JWT) {
  static readonly cookieExtractor = (req: Request) => req.cookies['accessToken'];

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: JwtStrategy.cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  public async validate(payload: AuthJwtPayload) {
    const isTokenBlacklisted = await this.tokenRepository.findOneBy({ content: payload.jti, isBlacklisted: true });
    if (isTokenBlacklisted) return null;

    const user = await this.userRepository.findOne({ where: { id: parseInt(payload.sub, 10) }, relations: { roles: true, picture: true } });

    return user;
  }
}
