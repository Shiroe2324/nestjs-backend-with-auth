import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TokenBlacklist } from '@/entities/token-blacklist';
import { AuthJwtPayload } from '@/types/common';

@Injectable()
export class JwtAccessService {
  constructor(
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
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
    const payload = this.decodeToken(token);
    const blacklistedToken = this.tokenBlacklistRepository.create({ token: payload.jti });
    await this.tokenBlacklistRepository.save(blacklistedToken);
  }

  public async isTokenBlacklisted(token: string) {
    const payload = this.decodeToken(token);
    const blacklistedToken = await this.tokenBlacklistRepository.findOneBy({ token: payload.jti });
    return !!blacklistedToken;
  }
}
