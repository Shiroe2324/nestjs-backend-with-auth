import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { CookieOptions } from 'express';
import ms from 'ms';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { Role } from '@/entities/role.entity';
import { Token } from '@/entities/token.entity';
import { User } from '@/entities/user.entity';
import { Roles } from '@/enums/roles.enum';
import { I18nTranslations } from '@/generated/i18n.generated';
import { JwtAccessService } from '@/modules/shared/jwt-access/jwt-access.service';
import { JwtRefreshService } from '@/modules/shared/jwt-refresh/jwt-refresh.service';
import { MailsService } from '@/modules/shared/mails/mails.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtAccessService: JwtAccessService,
    private readonly jwtRefreshService: JwtRefreshService,
    private readonly mailsService: MailsService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async login(identifier: string, password: string) {
    const user = await this.userRepository.findOneBy([{ username: identifier }, { email: identifier }]);

    if (!user) {
      throw new NotFoundException(this.i18n.t('auth.login.userNotFound'));
    }

    if (user.googleId || !user.password) {
      throw new ForbiddenException(this.i18n.t('auth.login.googleAuth'));
    }

    if (!user.isVerified) {
      throw new ForbiddenException(this.i18n.t('auth.login.emailNotVerified'));
    }

    const validPassword = await compare(password, user.password);

    if (!validPassword) {
      throw new ForbiddenException(this.i18n.t('auth.login.invalidPassword'));
    }

    const accessToken = this.jwtAccessService.generateToken(user.id);
    const refreshToken = this.jwtRefreshService.generateToken(user.id);

    this.logger.log(`User ${user.id} has logged in`);
    return { accessToken, refreshToken, message: this.i18n.t('auth.login.success') };
  }

  public async logout(accessToken: string, refreshToken: string) {
    const accessPayload = this.jwtAccessService.verifyToken(accessToken);
    const refreshPayload = this.jwtRefreshService.verifyToken(refreshToken);

    if (accessPayload.sub !== refreshPayload.sub) {
      throw new UnauthorizedException(this.i18n.t('auth.logout.invalidTokens'));
    }

    this.jwtAccessService.setTokenBlacklist(accessToken);
    this.jwtRefreshService.setTokenBlacklist(refreshToken);

    this.logger.log(`User ${accessPayload.sub} has logged out`);
    return { message: this.i18n.t('auth.logout.success') };
  }

  public async refreshTokens(refreshToken: string) {
    const { sub } = this.jwtRefreshService.verifyToken(refreshToken);

    if (await this.jwtRefreshService.isTokenBlacklisted(refreshToken)) {
      throw new UnauthorizedException(this.i18n.t('auth.refreshTokens.blacklisted'));
    }

    const user = await this.userRepository.findOneBy({ id: parseInt(sub, 10) });

    if (!user) {
      throw new NotFoundException(this.i18n.t('auth.refreshTokens.userNotFound'));
    }

    const accessToken = this.jwtAccessService.generateToken(user.id);
    const newRefreshToken = this.jwtRefreshService.generateToken(user.id);

    this.logger.log(`User ${user.id} has refreshed their tokens`);
    return { accessToken, newRefreshToken, message: this.i18n.t('auth.refreshTokens.success') };
  }

  public async register(email: string, password: string) {
    const existingUser = await this.userRepository.findOneBy({ email });

    if (existingUser) {
      throw new ConflictException(this.i18n.t('auth.register.emailInUse'));
    }

    const userRole = await this.roleRepository.findOneBy({ name: Roles.USER });

    if (!userRole) {
      throw new Error(this.i18n.t('auth.register.userRoleNotFound'));
    }

    const hashedPassword = await hash(password, 10);
    const emailVerificationToken = randomBytes(32).toString('hex');
    const expirationDate = new Date(Date.now() + this.getEmailExpiration);

    const token = this.tokenRepository.create({ content: emailVerificationToken, expirationDate });
    const user = this.userRepository.create({ email, password: hashedPassword, roles: [userRole], emailVerificationToken: token });

    await this.userRepository.save(user);
    this.mailsService.sendEmailVerificationEmail(email, emailVerificationToken);

    this.logger.log(`User ${user.id} has registered`);
    return { message: this.i18n.t('auth.register.success') };
  }

  public async verifyEmail(emailVerificationToken: string) {
    const token = await this.tokenRepository.findOneBy({ content: emailVerificationToken });

    if (!token || !token.expirationDate) {
      throw new NotFoundException(this.i18n.t('auth.verifyEmail.invalidToken'));
    }

    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: { id: token.id } },
      relations: { emailVerificationToken: true },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('auth.verifyEmail.invalidToken'));
    }

    if (token.expirationDate < new Date()) {
      await this.userRepository.remove(user);
      throw new UnauthorizedException(this.i18n.t('auth.verifyEmail.expiredToken'));
    }

    user.isVerified = true;

    await this.tokenRepository.remove(token);
    await this.userRepository.save(user);

    this.logger.log(`User ${user.id} has verified their email`);
    return { message: this.i18n.t('auth.verifyEmail.success') };
  }

  public async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(this.i18n.t('auth.forgotPassword.userNotFound'));
    }

    if (!user.isVerified) {
      throw new ForbiddenException(this.i18n.t('auth.forgotPassword.emailNotVerified'));
    }

    if (user.googleId) {
      throw new ForbiddenException(this.i18n.t('auth.forgotPassword.googleAuth'));
    }

    if (user.resetPasswordToken) {
      throw new ForbiddenException(this.i18n.t('auth.forgotPassword.pendingRequest'));
    }

    const resetPasswordToken = randomBytes(32).toString('hex');
    const expirationDate = new Date(Date.now() + this.getResetPasswordExpiration);
    const token = this.tokenRepository.create({ content: resetPasswordToken, expirationDate });

    user.resetPasswordToken = token;

    await this.userRepository.save(user);
    this.mailsService.sendResetPasswordEmail(email, resetPasswordToken);

    this.logger.log(`User ${user.id} has requested a password reset`);
    return { message: this.i18n.t('auth.forgotPassword.success') };
  }

  public async resetPassword(resetPasswordToken: string, newPassword: string) {
    const token = await this.tokenRepository.findOneBy({ content: resetPasswordToken });

    if (!token || !token.expirationDate) {
      throw new NotFoundException(this.i18n.t('auth.resetPassword.invalidToken'));
    }

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: { id: token.id } },
      relations: { resetPasswordToken: true },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('auth.resetPassword.noRequestFound'));
    }

    if (token.expirationDate < new Date()) {
      user.resetPasswordToken = null;
      user.resetPasswordToken = null;

      await this.userRepository.save(user);
      this.tokenRepository.remove(token);

      throw new UnauthorizedException(this.i18n.t('auth.resetPassword.expiredToken'));
    }

    user.password = await hash(newPassword, 10);

    await this.tokenRepository.remove(token);
    await this.userRepository.save(user);

    this.logger.log(`User ${user.id} has reset their password`);
    return { message: this.i18n.t('auth.resetPassword.success') };
  }

  public async googleLogin(user: User) {
    if (!user.googleId) {
      throw new UnauthorizedException(this.i18n.t('auth.googleLogin.notGoogleAuth'));
    }

    const accessToken = this.jwtAccessService.generateToken(user.id);
    const refreshToken = this.jwtRefreshService.generateToken(user.id);

    this.logger.log(`User ${user.id} has logged in with Google`);
    return { accessToken, refreshToken, redirectUrl: this.getGoogleRedirectUrl, message: this.i18n.t('auth.googleLogin.success') };
  }

  public get getAccessTokenCookieOptions(): CookieOptions {
    return { httpOnly: true, secure: this.isProduction, sameSite: 'strict', path: '/', maxAge: ms(this.getJwtAccessExpiration) };
  }

  public get getRefreshTokenCookieOptions(): CookieOptions {
    return { httpOnly: true, secure: this.isProduction, sameSite: 'strict', path: '/', maxAge: ms(this.getJwtRefreshExpiration) };
  }

  public get getClearCookieOptions(): CookieOptions {
    return { httpOnly: true, secure: this.isProduction, sameSite: 'strict', path: '/' };
  }

  private get getEmailExpiration() {
    return this.configService.getOrThrow<number>('main.emailVerificationExpiration');
  }

  private get getResetPasswordExpiration() {
    return this.configService.getOrThrow<number>('main.resetPasswordExpiration');
  }

  private get getGoogleRedirectUrl() {
    return this.configService.getOrThrow<string>('google.redirectUrl');
  }

  private get getJwtAccessExpiration() {
    return this.configService.getOrThrow<string>('jwt.accessExpiration');
  }

  private get getJwtRefreshExpiration() {
    return this.configService.getOrThrow<string>('jwt.refreshExpiration');
  }

  private get isProduction() {
    return this.configService.getOrThrow<boolean>('main.isProduction');
  }
}
