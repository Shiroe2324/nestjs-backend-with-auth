import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';

import { TokenBlacklist } from '@/entities/token-blacklist';
import { JwtRefreshService } from '@/modules/shared/jwt-refresh/jwt-refresh.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenBlacklist]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.refreshSecret'),
        signOptions: { expiresIn: configService.get('jwt.refreshExpiration'), jwtid: randomBytes(32).toString('hex') },
      }),
    }),
  ],
  providers: [JwtRefreshService],
  exports: [JwtRefreshService, TypeOrmModule],
})
export class JwtRefreshModule {}
