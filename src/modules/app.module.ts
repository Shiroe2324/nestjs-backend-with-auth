import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, CookieResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

import cloudinaryConfig from '@/config/cloudinary.config';
import databaseConfig from '@/config/database.config';
import emailConfig from '@/config/email.config';
import googleConfig from '@/config/google.config';
import jwtConfig from '@/config/jwt.config';
import limitsConfig from '@/config/limits.config';
import mainConfig from '@/config/main.config';
import { Picture } from '@/entities/picture.entity';
import { Role } from '@/entities/role.entity';
import { Token } from '@/entities/token.entity';
import { User } from '@/entities/user.entity';
import { Strategies } from '@/enums/strategies.enum';
import { AuthModule } from '@/modules/auth/auth.module';
import { TasksModule } from '@/modules/shared/tasks/tasks.module';
import { UsersModule } from '@/modules/users/users.module';
import { resolvePath } from '@/utils/resolve-path';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [cloudinaryConfig, databaseConfig, emailConfig, googleConfig, jwtConfig, limitsConfig, mainConfig],
    }),
    I18nModule.forRootAsync({
      inject: [ConfigService],
      resolvers: [new QueryResolver(['lang', 'l']), new HeaderResolver(['x-custom-lang', 'x-lang']), new CookieResolver(), AcceptLanguageResolver],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('main.defaultLanguage'),
        viewEngine: 'hbs',
        typesOutputPath: resolvePath('../src/generated/i18n.generated.ts'),
        loaderOptions: { path: resolvePath('i18n/'), watch: configService.getOrThrow<boolean>('main.isDevelopment') },
      }),
    }),
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
        entities: [Picture, Role, Token, User],
      }),
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    PassportModule.register({ defaultStrategy: Strategies.JWT }),
    AuthModule,
    UsersModule,
    TasksModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
