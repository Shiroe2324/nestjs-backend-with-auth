import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Repository } from 'typeorm';

import { Picture } from '@/entities/picture.entity';
import { Role } from '@/entities/role.entity';
import { User } from '@/entities/user.entity';
import { Roles } from '@/enums/roles.enum';
import { Strategies } from '@/enums/strategies.enum';
import { I18nTranslations } from '@/generated/i18n.generated';
import { parseDisplayName } from '@/utils/parse-display-name';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, Strategies.GOOGLE) {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    @InjectRepository(Picture)
    private readonly pictureRepository: Repository<Picture>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    super({
      clientID: configService.getOrThrow<string>('google.clientId'),
      clientSecret: configService.getOrThrow<string>('google.clientSecret'),
      callbackURL: configService.getOrThrow<string>('google.callbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  public async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const { id, displayName, emails, photos } = profile;
    if (!emails || !emails.length) throw new BadRequestException(this.i18n.t('auth.emailRequired'));

    let user = await this.userRepository.findOneBy({ googleId: id });

    if (!user) {
      const googleId = id;
      const email = emails[0].value;
      const picture = photos ? this.pictureRepository.create({ url: photos[0].value }) : null;
      const name = parseDisplayName(displayName);

      if (await this.userRepository.existsBy({ email })) {
        throw new ConflictException(this.i18n.t('auth.emailInUse'));
      }

      const userRole = await this.roleRepository.findOneBy({ name: Roles.USER });

      if (!userRole) {
        throw new Error(this.i18n.t('auth.userRoleNotFound'));
      }

      user = this.userRepository.create({ googleId, displayName: name, email, roles: [userRole], picture, isVerified: true });
      await this.userRepository.save(user);
      this.logger.log(`User ${user.id} has registered with Google`);
    }

    return done(null, user);
  }
}
