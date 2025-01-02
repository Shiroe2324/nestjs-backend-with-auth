import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '@/entities/role.entity';
import { User } from '@/entities/user.entity';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtAccessModule } from '@/modules/shared/jwt-access/jwt-access.module';
import { JwtRefreshModule } from '@/modules/shared/jwt-refresh/jwt-refresh.module';
import { MailsModule } from '@/modules/shared/mails/mails.module';
import { GoogleStrategy } from '@/strategies/google.strategy';
import { JwtStrategy } from '@/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), JwtAccessModule, JwtRefreshModule, MailsModule],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
