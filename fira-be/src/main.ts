import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { EntityManager } from 'typeorm';
import * as rateLimitMiddleware from 'express-rate-limit';

import { AppModule } from './app.module';
import * as config from './config';
import { Config } from './admin/entity/config.entity';
import { AppLogger } from './logger/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appLogger = await app.resolve(AppLogger);
  appLogger.setContext('Main-Bootstrap');

  const rateLimit = config.application.rateLimit;
  appLogger.log(
    `installing rate-limiting middleware, rate limit: ${JSON.stringify(
      rateLimit,
    )}`,
  );
  app.use(rateLimitMiddleware(rateLimit));

  appLogger.log('setting up swagger module...');
  const options = new DocumentBuilder()
    .setTitle('fira backend')
    .setDescription('The fira backend API description')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  appLogger.log('setting up request validation pipe...');
  app.useGlobalPipes(new ValidationPipe());

  // set default config values in DB, if no values are present
  appLogger.log('setting up application config values...');
  const entityManager = app.get(EntityManager);
  const [dbConfig, countOfConfigs] = await entityManager.findAndCount(Config);
  if (countOfConfigs > 0) {
    appLogger.log(
      `application config values found in DB --> skip setting initial values. Values in DB are: ${JSON.stringify(
        dbConfig[0],
      )}`,
    );
  } else {
    const initialConfig = new Config();
    initialConfig.annotationTargetPerUser =
      config.application.initialAnnotationTargetPerUser;
    initialConfig.annotationTargetPerJudgPair =
      config.application.initialAnnotationTargetPerJudgPair;
    appLogger.log(
      `no application config values found in DB --> set initial values. Initial values are: ${JSON.stringify(
        initialConfig,
      )}`,
    );
    await entityManager.save(Config, initialConfig);
  }

  appLogger.log('starting application...');
  await app.listen(config.application.port);
}
bootstrap();
