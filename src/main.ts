import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from '@/modules/app.module';

const { FRONTEND_URL, PORT } = process.env;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const classSerializerInterceptor = new ClassSerializerInterceptor(app.get(Reflector));
  const validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    errorHttpStatusCode: 422,
  });

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(classSerializerInterceptor);
  app.useGlobalPipes(validationPipe);
  app.enableCors({ origin: FRONTEND_URL, credentials: true });
  app.use(compression());
  app.use(helmet());
  app.use(cookieParser());

  await app.listen(PORT ?? 3000);
}
bootstrap();
