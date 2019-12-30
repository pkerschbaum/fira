import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import * as config from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // bootstrap swagger
  const options = new DocumentBuilder()
    .setTitle('fira backend')
    .setDescription('The fira backend API description')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.application.port);
}
bootstrap();
