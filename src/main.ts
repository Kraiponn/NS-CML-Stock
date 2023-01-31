import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import helmet from 'helmet';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const PORT = configService.get<number>('PORT') || 8000;
  const appMode = configService.get<string>('NODE_ENV') || 'development';

  if (appMode === 'development') {
    app.enableCors();
  } else {
    app.enableCors({
      credentials: true,
      origin: [
        'https://www.codemakerlab.com',
        'https://www.ksn-development.com',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });

    app.use(csurf());
  }

  app.setGlobalPrefix('api');
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(PORT, () => {
    if (appMode === 'development') {
      console.log(`Service is running at ${PORT}(port) on ${appMode} mode`);
    }
  });
}

bootstrap();
