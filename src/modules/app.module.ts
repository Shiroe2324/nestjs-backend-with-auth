import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, CookieResolver, HeaderResolver, I18nModule, I18nService, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';

import cloudinaryConfig from '@/config/cloudinary.config';
import databaseConfig from '@/config/database.config';
import emailConfig from '@/config/email.config';
import googleConfig from '@/config/google.config';
import jwtConfig from '@/config/jwt.config';
import limitsConfig from '@/config/limits.config';
import mainConfig from '@/config/main.config';
import { TokenBlacklist } from '@/entities/token-blacklist.entity';
import { User } from '@/entities/user.entity';
import { Strategies } from '@/enums/strategies.enum';
import { AuthModule } from '@/modules/auth/auth.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [cloudinaryConfig, databaseConfig, emailConfig, googleConfig, jwtConfig, limitsConfig, mainConfig],
    }),
    ScheduleModule.forRoot(),
    I18nModule.forRootAsync({
      inject: [ConfigService],
      resolvers: [new QueryResolver(['lang', 'l']), new HeaderResolver(['x-custom-lang', 'x-lang']), new CookieResolver(), AcceptLanguageResolver],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('main.defaultLanguage'),
        typesOutputPath: join(__dirname, '../../src/generated/i18n.generated.ts'),
        viewEngine: 'hbs',
        loaderOptions: {
          path: join(__dirname, '..', 'i18n/'),
          watch: configService.getOrThrow<boolean>('main.isDevelopment'),
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
        synchronize: configService.getOrThrow('main.isDevelopment'),
        entities: [User, TokenBlacklist],
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService, I18nService],
      useFactory: (configService: ConfigService, i18n: I18nService) => ({
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
          adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
          options: { strict: true },
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: Strategies.JWT }),
    AuthModule,
    UsersModule,
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
