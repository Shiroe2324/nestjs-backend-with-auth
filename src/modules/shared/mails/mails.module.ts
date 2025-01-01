import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

import { MailsService } from '@/modules/shared/mails/mails.service';
import { resolvePath } from '@/utils/resolve-path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService, I18nService],
      useFactory: (configService: ConfigService, i18n: I18nService) => ({
        transport: {
          host: configService.getOrThrow('email.host'),
          port: configService.getOrThrow('email.port'),
          secure: configService.getOrThrow('email.secure'),
          auth: { user: configService.getOrThrow('email.username'), pass: configService.getOrThrow('email.password') },
        },
        template: {
          dir: resolvePath('templates'),
          adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
          options: { strict: true },
        },
        defaults: { from: `"No Reply" <${configService.getOrThrow('email.from')}>` },
      }),
    }),
  ],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
