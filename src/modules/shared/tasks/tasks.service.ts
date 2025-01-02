import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import ms from 'ms';
import { LessThan, Repository } from 'typeorm';

import { Role } from '@/entities/role.entity';
import { TokenBlacklist } from '@/entities/token-blacklist.entity';
import { User } from '@/entities/user.entity';
import { Roles } from '@/enums/roles.enum';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  public async onApplicationBootstrap() {
    await this.createRoles();
  }

  private async createRoles() {
    try {
      const existingRoles = await this.roleRepository.find();
      const existingRoleNames = existingRoles.map((role) => role.name);

      const missingRoles = Object.values(Roles).filter((role) => !existingRoleNames.includes(role));

      if (missingRoles.length > 0) {
        const newRoles = missingRoles.map((roleName) => this.roleRepository.create({ name: roleName }));
        await this.roleRepository.save(newRoles);
        this.logger.log(`Roles created: ${missingRoles.join(', ')}`);
      } else {
        this.logger.log('All roles already exist.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize roles', error instanceof Error ? error.stack : error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async clearTokenBlacklistTask() {
    try {
      this.logger.log('Clearing token blacklist...');

      const cutoffDate = new Date(Date.now() - this.getRefreshTokenExpiration);
      const result = await this.tokenBlacklistRepository.delete({ createdAt: LessThan(cutoffDate) });

      this.logger.log(`Removed ${result.affected} expired tokens from the blacklist`);
    } catch (error) {
      this.logger.error('Failed to clear expired tokens from the blacklist', error instanceof Error ? error.stack : error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async clearUserWithoutVerificationTask() {
    try {
      this.logger.log('Clearing users without verification...');

      const cutoffDate = new Date(Date.now() - this.getEmailExpiration);
      const result = await this.userRepository.delete({ createdAt: LessThan(cutoffDate), isVerified: false });

      this.logger.log(`Removed ${result.affected} users without verification`);
    } catch (error) {
      this.logger.error('Failed to clear users without verification', error instanceof Error ? error.stack : error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async removeResetPasswordTask() {
    try {
      this.logger.log('Removing reset password tokens...');

      const cutoffDate = new Date(Date.now() - this.getResetPasswordExpiration);
      const result = await this.userRepository.update(
        { resetPasswordExpires: LessThan(cutoffDate) },
        { resetPasswordToken: null, resetPasswordExpires: null },
      );

      this.logger.log(`Removed reset password tokens from ${result.affected} users`);
    } catch (error) {
      this.logger.error('Failed to remove reset password tokens', error instanceof Error ? error.stack : error);
    }
  }

  private get getRefreshTokenExpiration() {
    return ms(this.configService.getOrThrow<string>('jwt.refreshExpiration'));
  }

  private get getEmailExpiration() {
    return this.configService.getOrThrow<number>('main.emailVerificationExpiration');
  }

  private get getResetPasswordExpiration() {
    return this.configService.getOrThrow<number>('main.resetPasswordExpiration');
  }
}
