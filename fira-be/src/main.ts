import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import * as config from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // add rate limiting
  app.use(rateLimit(config.application.rateLimit));

  // bootstrap swagger
  const options = new DocumentBuilder()
    .setTitle('fira backend')
    .setDescription('The fira backend API description')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // add request validation
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(config.application.port);
}
bootstrap();
