import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { TokenBlacklist } from '@/entities/token-blacklist';
import { User } from '@/entities/user.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async clearTokenBlacklistTask() {
    try {
      this.logger.log('Clearing token blacklist...');

      const cutoffDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      const result = await this.tokenBlacklistRepository.delete({ createdAt: LessThan(cutoffDate) });

      this.logger.log(`Removed ${result.affected} expired tokens from the blacklist`);
    } catch (error) {
      this.logger.error('Failed to clear expired tokens from the blacklist', error instanceof Error ? error.stack : error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async clearUserWithoutVerificationTask() {
    try {
      this.logger.log('Clearing users without verification...');

      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await this.userRepository.delete({ createdAt: LessThan(cutoffDate), isVerified: false });

      this.logger.log(`Removed ${result.affected} users without verification`);
    } catch (error) {
      this.logger.error('Failed to clear users without verification', error instanceof Error ? error.stack : error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async removeResetPasswordTask() {
    try {
      this.logger.log('Removing reset password tokens...');

      const cutoffDate = new Date(Date.now() - 60 * 60 * 1000);
      const result = await this.userRepository.update(
        { resetPasswordExpires: LessThan(cutoffDate) },
        { resetPasswordToken: null, resetPasswordExpires: null },
      );

      this.logger.log(`Removed reset password tokens from ${result.affected} users`);
    } catch (error) {
      this.logger.error('Failed to remove reset password tokens', error instanceof Error ? error.stack : error);
    }
  }
}
