import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';

import { Token } from '@/entities/token.entity';
import { JwtRefreshService } from '@/modules/shared/jwt-refresh/jwt-refresh.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('jwt.refreshSecret'),
        signOptions: { expiresIn: configService.getOrThrow('jwt.refreshExpiration'), jwtid: randomBytes(32).toString('hex') },
      }),
    }),
  ],
  providers: [JwtRefreshService],
  exports: [JwtRefreshService, TypeOrmModule],
})
export class JwtRefreshModule {}
