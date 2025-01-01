import { ClassSerializerInterceptor, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import helmet from 'helmet';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { AppModule } from '@/modules/app.module';
import { validationErrorFormatter } from '@/utils/validation-error-formatter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('main.port');
  const frontendUrl = configService.getOrThrow<string>('main.frontendUrl');

  const validationPipe = new I18nValidationPipe({
    whitelist: true,
    transform: true,
    validationError: { value: true },
    transformOptions: { enableImplicitConversion: true },
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    stopAtFirstError: true,
  });

  const validationExceptionFilter = new I18nValidationExceptionFilter({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    errorFormatter: validationErrorFormatter,
  });

  app.enableCors({ origin: frontendUrl, credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(validationExceptionFilter);
  app.use(compression());
  app.use(helmet());
  app.use(cookieParser());

  await app.listen(port);
}
bootstrap();
