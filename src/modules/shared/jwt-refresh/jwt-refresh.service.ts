import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Token } from '@/entities/token.entity';
import { AuthJwtPayload } from '@/types/common';

@Injectable()
export class JwtRefreshService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
  ) {}

  public generateToken(userId: string | number) {
    return this.jwtService.sign({}, { subject: userId.toString() });
  }

  public verifyToken(token: string) {
    return this.jwtService.verify(token) as AuthJwtPayload;
  }

  public decodeToken(token: string) {
    return this.jwtService.decode(token) as AuthJwtPayload;
  }

  public async setTokenBlacklist(token: string) {
    const { jti, exp } = this.decodeToken(token);
    const expirationDate = new Date(exp * 1000);
    const blacklistedToken = this.tokenRepository.create({ content: jti, expirationDate, isBlacklisted: true });
    await this.tokenRepository.save(blacklistedToken);
  }

  public async isTokenBlacklisted(token: string) {
    const payload = this.decodeToken(token);
    const blacklistedToken = await this.tokenRepository.findOneBy({ content: payload.jti, isBlacklisted: true });
    return !!blacklistedToken;
  }
}
