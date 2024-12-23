import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { I18nValidationPipe } from 'nestjs-i18n';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';

import { AppModule } from '@/modules/app.module';

const { FRONTEND_URL, PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const classSerializerInterceptor = new ClassSerializerInterceptor(app.get(Reflector));
  const i18nValidationPipe = new I18nValidationPipe();
  const i18nValidationExceptionFilter = new I18nValidationExceptionFilter();
  const validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    errorHttpStatusCode: 422,
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(i18nValidationExceptionFilter);
  app.useGlobalInterceptors(classSerializerInterceptor);
  app.useGlobalPipes(validationPipe, i18nValidationPipe);
  app.enableCors({ origin: FRONTEND_URL, credentials: true });
  app.use(compression());
  app.use(helmet());
  app.use(cookieParser());

  await app.listen(PORT ?? 3000);
}
bootstrap();
