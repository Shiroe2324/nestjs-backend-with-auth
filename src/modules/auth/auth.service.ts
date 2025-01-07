import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
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
  private readonly emailExpiration = this.configService.getOrThrow<number>('main.emailVerificationExpiration');
  private readonly resetPasswordExpiration = this.configService.getOrThrow<number>('main.resetPasswordExpiration');
  private readonly googleRedirectUrl = this.configService.getOrThrow<string>('google.redirectUrl');

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
    const user = await this.getVerifiedCredentialUser(identifier);

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) throw new ForbiddenException(this.i18n.t('auth.invalidPassword'));

    const tokens = this.generateTokens(user.id);

    this.logger.log(`User ${user.id} has logged in`);
    return { ...tokens, message: this.i18n.t('auth.login.success') };
  }

  public async logout(accessToken: string, refreshToken: string) {
    const accessPayload = this.jwtAccessService.verifyToken(accessToken);
    const refreshPayload = this.jwtRefreshService.verifyToken(refreshToken);

    if (accessPayload.sub !== refreshPayload.sub) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidToken', { args: { count: 2 } }));
    }

    this.jwtAccessService.setTokenBlacklist(accessToken);
    this.jwtRefreshService.setTokenBlacklist(refreshToken);

    this.logger.log(`User ${accessPayload.sub} has logged out`);
    return { message: this.i18n.t('auth.logout.success') };
  }

  public async refreshTokens(refreshToken: string) {
    const { sub } = this.jwtRefreshService.verifyToken(refreshToken);

    if (await this.jwtRefreshService.isTokenBlacklisted(refreshToken)) {
      throw new UnauthorizedException(this.i18n.t('auth.invalidToken', { args: { count: 2 } }));
    }

    const user = await this.userRepository.findOneBy({ id: parseInt(sub, 10) });
    if (!user) throw new NotFoundException(this.i18n.t('auth.userNotFound'));

    const tokens = this.generateTokens(user.id);

    this.logger.log(`User ${user.id} has refreshed their tokens`);
    return { ...tokens, message: this.i18n.t('auth.refreshTokens.success') };
  }

  public async register(email: string, password: string) {
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) throw new ConflictException(this.i18n.t('auth.emailInUse'));

    const userRole = await this.roleRepository.findOneBy({ name: Roles.USER });
    if (!userRole) throw new Error(this.i18n.t('auth.userRoleNotFound'));

    const hashedPassword = await hash(password, 10);
    const emailVerificationToken = randomBytes(32).toString('hex');
    const expirationDate = new Date(Date.now() + this.emailExpiration);

    const token = this.tokenRepository.create({ content: emailVerificationToken, expirationDate });
    const user = this.userRepository.create({ email, password: hashedPassword, roles: [userRole], emailVerificationToken: token });

    await this.userRepository.save(user);
    this.mailsService.sendEmailVerificationEmail(email, emailVerificationToken);

    this.logger.log(`User ${user.id} has registered`);
    return { message: this.i18n.t('auth.register.success') };
  }

  public async verifyEmail(emailVerificationToken: string) {
    const token = await this.getToken(emailVerificationToken);
    const user = await this.getUserByToken(token, 'emailVerificationToken');

    if (token.expirationDate < new Date()) {
      await this.tokenRepository.remove(token);
      await this.userRepository.remove(user);
      throw new UnauthorizedException(this.i18n.t('auth.invalidToken', { args: { count: 1 } }));
    }

    user.isVerified = true;

    await this.tokenRepository.remove(token);
    await this.userRepository.save(user);

    this.logger.log(`User ${user.id} has verified their email`);
    return { message: this.i18n.t('auth.verifyEmail.success') };
  }

  public async forgotPassword(email: string) {
    const resetPasswordToken = randomBytes(32).toString('hex');
    const expirationDate = new Date(Date.now() + this.resetPasswordExpiration);
    const token = this.tokenRepository.create({ content: resetPasswordToken, expirationDate });

    const user = await this.getVerifiedCredentialUser(email);
    if (user.resetPasswordToken) throw new ForbiddenException(this.i18n.t('auth.forgotPassword.pendingRequest'));

    user.resetPasswordToken = token;

    await this.userRepository.save(user);
    this.mailsService.sendResetPasswordEmail(email, resetPasswordToken);

    this.logger.log(`User ${user.id} has requested a password reset`);
    return { message: this.i18n.t('auth.forgotPassword.success') };
  }

  public async resetPassword(resetPasswordToken: string, newPassword: string) {
    const token = await this.getToken(resetPasswordToken);
    const user = await this.getUserByToken(token, 'resetPasswordToken');

    if (token.expirationDate < new Date()) {
      await this.tokenRepository.remove(token);
      throw new UnauthorizedException(this.i18n.t('auth.invalidToken', { args: { count: 1 } }));
    }

    user.password = await hash(newPassword, 10);

    await this.tokenRepository.remove(token);
    await this.userRepository.save(user);

    this.logger.log(`User ${user.id} has reset their password`);
    return { message: this.i18n.t('auth.resetPassword.success') };
  }

  public async googleLogin(user: User) {
    if (!user.googleId) throw new UnauthorizedException(this.i18n.t('auth.userWithoutGoogleAuth'));

    const tokens = this.generateTokens(user.id);

    this.logger.log(`User ${user.id} has logged in with Google`);
    return { ...tokens, redirectUrl: this.googleRedirectUrl, message: this.i18n.t('auth.googleLogin.success') };
  }

  private generateTokens(userId: number) {
    const accessToken = this.jwtAccessService.generateToken(userId);
    const refreshToken = this.jwtRefreshService.generateToken(userId);

    return { accessToken, refreshToken };
  }

  private async getToken(token: string) {
    const foundToken = await this.tokenRepository.findOneBy({ content: token });
    if (!foundToken) throw new NotFoundException(this.i18n.t('auth.invalidToken', { args: { count: 1 } }));

    return foundToken;
  }

  private async getUserByToken(token: Token, type: 'emailVerificationToken' | 'resetPasswordToken') {
    const user = await this.userRepository.findOne({ where: { [type]: { id: token.id } }, relations: { [type]: true } });
    if (!user) throw new NotFoundException(this.i18n.t('auth.invalidToken', { args: { count: 1 } }));

    return user;
  }

  private async getVerifiedCredentialUser(identifier: string) {
    const user = await this.userRepository.findOneBy([{ username: identifier }, { email: identifier }]);
    if (!user) throw new NotFoundException(this.i18n.t('auth.userNotFound'));

    if (user.googleId) throw new ForbiddenException(this.i18n.t('auth.userWithGoogleAuth'));
    if (!user.password) throw new ForbiddenException(this.i18n.t('auth.userWithoutPassword'));
    if (!user.isVerified) throw new ForbiddenException(this.i18n.t('auth.userWithEmailNotVerified'));

    return user as User & { password: string };
  }
}
