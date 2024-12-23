import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, CookieResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';

import { configuration } from '@/config/configuration';
import { TokenBlacklist } from '@/entities/token-blacklist.entity';
import { User } from '@/entities/user.entity';
import { Strategies } from '@/enums/strategies.enum';
import { AuthModule } from '@/modules/auth/auth.module';
import { TasksModule } from '@/modules/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
    I18nModule.forRootAsync({
      inject: [ConfigService],
      resolvers: [new QueryResolver(['lang', 'l']), new HeaderResolver(['x-custom-lang']), new CookieResolver(), AcceptLanguageResolver],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('server.defaultLanguage'),
        typesOutputPath: join(__dirname, '../../src/generated/i18n.generated.ts'),
        loaderOptions: {
          path: join(__dirname, '../i18n/'),
          watch: configService.getOrThrow<boolean>('server.isDevelopment'),
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow('database.host'),
        port: configService.getOrThrow('database.port'),
        username: configService.getOrThrow('database.username'),
        password: configService.getOrThrow('database.password'),
        database: configService.getOrThrow('database.name'),
        synchronize: configService.getOrThrow('server.isDevelopment'),
        entities: [User, TokenBlacklist],
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow('email.host'),
          port: configService.getOrThrow('email.port'),
          secure: configService.getOrThrow('email.secure'),
          auth: {
            user: configService.getOrThrow('email.username'),
            pass: configService.getOrThrow('email.password'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.getOrThrow('email.from')}>`,
        },
        template: {
          dir: join(__dirname, '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: Strategies.JWT }),
    AuthModule,
    TasksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
