import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';

import { TokenBlacklist } from '@/entities/token-blacklist';
import { JwtAccessService } from '@/modules/shared/jwt-access/jwt-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenBlacklist]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get('jwt.accessExpiration'), jwtid: randomBytes(32).toString('hex') },
      }),
    }),
  ],
  providers: [JwtAccessService],
  exports: [JwtAccessService, TypeOrmModule],
})
export class JwtAccessModule {}
