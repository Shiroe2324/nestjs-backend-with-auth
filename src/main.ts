import { ClassSerializerInterceptor, HttpStatus } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import helmet from 'helmet';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { AppModule } from '@/modules/app.module';

const { FRONTEND_URL, PORT = 4000 } = process.env;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
    errorFormatter: (errors) => errors.map((error) => ({ field: error.property, content: Object.values(error.constraints || {}).join(', ') })),
  });

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(validationExceptionFilter);
  app.enableCors({ origin: FRONTEND_URL, credentials: true });
  app.use(compression());
  app.use(helmet());
  app.use(cookieParser());

  await app.listen(PORT);
}
bootstrap();
