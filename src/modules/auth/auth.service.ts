import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { CookieOptions } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { User } from '@/entities/user.entity';
import { I18nTranslations } from '@/generated/i18n.generated';
import { JwtAccessService } from '@/modules/shared/jwt-access/jwt-access.service';
import { JwtRefreshService } from '@/modules/shared/jwt-refresh/jwt-refresh.service';
import { MailsService } from '@/modules/shared/mails/mails.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtAccessService: JwtAccessService,
    private readonly jwtRefreshService: JwtRefreshService,
    private readonly mailsService: MailsService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async login(identifier: string, password: string) {
    const user = await this.userRepository.findOneBy([{ username: identifier }, { email: identifier }]);
    if (!user) throw new NotFoundException(this.i18n.t('auth.login.userNotFound'));
    if (user.googleId) throw new ForbiddenException(this.i18n.t('auth.login.googleAuth'));
    if (!user.isVerified) throw new ForbiddenException(this.i18n.t('auth.login.emailNotVerified'));

    const validPassword = await compare(password, user.password);
    if (!validPassword) throw new ForbiddenException(this.i18n.t('auth.login.invalidPassword'));

    const accessToken = this.jwtAccessService.generateToken(user.id);
    const refreshToken = this.jwtRefreshService.generateToken(user.id);

    this.logger.log(`User ${user.id} has logged in`);
    return { accessToken, refreshToken, message: this.i18n.t('auth.login.success') };
  }

  public async logout(accessToken: string, refreshToken: string) {
    const accessPayload = this.jwtAccessService.verifyToken(accessToken);
    const refreshPayload = this.jwtRefreshService.verifyToken(refreshToken);

    if (accessPayload.sub !== refreshPayload.sub) throw new UnauthorizedException(this.i18n.t('auth.logout.invalidTokens'));

    this.jwtAccessService.setTokenBlacklist(accessToken);
    this.jwtRefreshService.setTokenBlacklist(refreshToken);

    this.logger.log(`User ${accessPayload.sub} has logged out`);
    return { message: this.i18n.t('auth.logout.success') };
  }

  public async refreshTokens(refreshToken: string) {
    const { sub } = this.jwtRefreshService.verifyToken(refreshToken);

    if (await this.jwtRefreshService.isTokenBlacklisted(refreshToken)) throw new UnauthorizedException(this.i18n.t('auth.refreshTokens.blacklisted'));

    const user = await this.userRepository.findOneBy({ id: parseInt(sub, 10) });
    if (!user) throw new NotFoundException(this.i18n.t('auth.refreshTokens.userNotFound'));

    const accessToken = this.jwtAccessService.generateToken(user.id);
    const newRefreshToken = this.jwtRefreshService.generateToken(user.id);

    this.logger.log(`User ${user.id} has refreshed their tokens`);
    return { accessToken, newRefreshToken, message: this.i18n.t('auth.refreshTokens.success') };
  }

  public async register(username: string, email: string, password: string) {
    const existingUser = await this.userRepository.findOneBy([{ username }, { email }]);

    if (existingUser) {
      if (existingUser.username === username) throw new ConflictException(this.i18n.t('auth.register.usernameInUse'));
      if (existingUser.email === email) throw new ConflictException(this.i18n.t('auth.register.emailInUse'));
    }

    const hashedPassword = await hash(password, 10);
    const emailVerificationToken = randomBytes(32).toString('hex');
    const user = this.userRepository.create({ username, email, password: hashedPassword, emailVerificationToken });

    await this.userRepository.save(user);
    this.mailsService.sendEmailVerificationEmail(email, emailVerificationToken);

    this.logger.log(`User ${user.id} has registered`);
    return { message: this.i18n.t('auth.register.success') };
  }

  public async verifyEmail(emailVerificationToken: string) {
    const user = await this.userRepository.findOneBy({ emailVerificationToken });
    if (!user || user.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      throw new NotFoundException(this.i18n.t('auth.verifyEmail.invalidToken'));
    }

    user.isVerified = true;
    user.emailVerificationToken = null;

    await this.userRepository.save(user);

    this.logger.log(`User ${user.id} has verified their email`);
    return { message: this.i18n.t('auth.verifyEmail.success') };
  }

  public async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new NotFoundException(this.i18n.t('auth.forgotPassword.userNotFound'));
    if (!user.isVerified) throw new ForbiddenException(this.i18n.t('auth.forgotPassword.emailNotVerified'));
    if (user.googleId) throw new ForbiddenException(this.i18n.t('auth.forgotPassword.googleAuth'));
    if (user.resetPasswordExpires || user.resetPasswordToken) throw new ForbiddenException(this.i18n.t('auth.forgotPassword.pendingRequest'));

    const resetPasswordToken = randomBytes(32).toString('hex');
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepository.save(user);
    this.mailsService.sendResetPasswordEmail(email, resetPasswordToken);

    this.logger.log(`User ${user.id} has requested a password reset`);
    return { message: this.i18n.t('auth.forgotPassword.success') };
  }

  public async resetPassword(resetPasswordToken: string, newPassword: string) {
    const user = await this.userRepository.findOneBy({ resetPasswordToken });
    if (!user || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException(this.i18n.t('auth.resetPassword.invalidToken'));
    }

    user.password = await hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    this.logger.log(`User ${user.id} has reset their password`);
    return { message: this.i18n.t('auth.resetPassword.success') };
  }

  public async googleLogin(user: User) {
    if (!user.googleId) throw new UnauthorizedException(this.i18n.t('auth.googleLogin.notGoogleAuth'));

    const redirectUrl = this.configService.get<string>('google.redirectUrl');
    const accessToken = this.jwtAccessService.generateToken(user.id);
    const refreshToken = this.jwtRefreshService.generateToken(user.id);

    this.logger.log(`User ${user.id} has logged in with Google`);
    return { accessToken, refreshToken, redirectUrl, message: this.i18n.t('auth.googleLogin.success') };
  }

  public get getAccessTokenCookieOptions(): CookieOptions {
    return { httpOnly: true, secure: this.configService.getOrThrow('server.isProduction'), sameSite: 'strict', path: '/', maxAge: 3600000 };
  }

  public get getRefreshTokenCookieOptions(): CookieOptions {
    return { httpOnly: true, secure: this.configService.getOrThrow('server.isProduction'), sameSite: 'strict', path: '/', maxAge: 604800016 };
  }

  public get getClearCookieOptions(): CookieOptions {
    return { httpOnly: true, secure: this.configService.getOrThrow('server.isProduction'), sameSite: 'strict', path: '/' };
  }
}
