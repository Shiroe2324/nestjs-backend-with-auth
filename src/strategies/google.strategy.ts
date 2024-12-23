import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { User } from '@/entities/user.entity';
import { Strategies } from '@/enums/strategies.enum';
import { I18nTranslations } from '@/generated/i18n.generated';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, Strategies.GOOGLE) {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  public async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const { id, emails, photos } = profile;

    let user = await this.userRepository.findOneBy({ googleId: id });

    if (!user) {
      const googleId = id;
      const email = emails[0]?.value;
      const picture = photos[0]?.value || null;

      if (await this.userRepository.existsBy({ email })) {
        throw new ConflictException(this.i18n.t('auth.register.emailInUse'));
      }

      const username = await this.generateUsername();

      user = this.userRepository.create({ googleId, username, email, picture, isVerified: true });
      await this.userRepository.save(user);
      this.logger.log(`User ${user.id} has registered with Google`);
    }

    return done(null, user);
  }

  private async generateUsername() {
    let username = `user${uuidv4().slice(0, 8)}`;

    while (await this.userRepository.existsBy({ username })) {
      username = `user${uuidv4().slice(0, 8)}`;
    }

    return username.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
