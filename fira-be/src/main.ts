import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as rateLimitMiddleware from 'express-rate-limit';

import { AppModule } from './app.module';
import * as config from './config';
import { AppLogger } from './logger/app-logger.service';
import { importInitialData } from './boot/import-initial-data';
import { IdentityManagementService } from './identity-management/identity-management.service';
import { AdminService } from './admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appLogger = await app.resolve(AppLogger);
  appLogger.setContext('Main-Bootstrap');

  await importInitialData({
    logger: appLogger,
    imService: app.get(IdentityManagementService),
    adminService: app.get(AdminService),
  });

  const rateLimit = config.application.rateLimit;
  appLogger.log(`installing rate-limiting middleware, rate limit: ${JSON.stringify(rateLimit)}`);
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

  appLogger.log('starting application...');
  await app.listen(config.application.port);
}
bootstrap();
