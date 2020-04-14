import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as config from './config';
import { AppModule } from './app.module';
import { AppLogger } from './commons/app-logger.service';
import { importInitialData } from './boot/import-initial-data';
import { IdentityManagementService } from './identity-management/identity-management.service';
import { AdminService } from './admin/admin.service';
import { RedirectClientFilter } from './filter/redirect-client.filter';

const RUNNING_LOG_INTERVAL = 1000; // ms

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appLogger = await app.resolve(AppLogger);
  appLogger.setContext('Main-Bootstrap');

  // set global prefix which is applied to all HTTP endpoints and the Swagger UI, but not to
  // the static path the web app is served with
  app.setGlobalPrefix(`${config.application.urlPaths.web}${config.application.urlPaths.api}`);

  // define a filter which will serve index.html of the web app for every request, except when it starts
  // with the urlPaths.api prefix. In that case, the request should be handled by an HTTP endpoint.
  // Serving index.html is sufficient since the single page application will handle further routing on the client side
  app.useGlobalFilters(
    new RedirectClientFilter(app.get(HttpAdapterHost).httpAdapter.getHttpServer()),
  );

  // now, import all data for Fira
  await importInitialData({
    logger: appLogger,
    imService: await app.resolve(IdentityManagementService),
    adminService: await app.resolve(AdminService),
  });

  // set up Swagger doc and UI
  appLogger.log('setting up swagger module...');
  const options = new DocumentBuilder()
    .setTitle('fira backend')
    .setDescription('The fira backend API description')
    .setVersion(config.application.version)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // validate all requests according to the Swagger schema
  appLogger.log('setting up request validation pipe...');
  app.useGlobalPipes(new ValidationPipe());

  // schedule logging
  setInterval(() => {
    appLogger.log('server is running');
  }, RUNNING_LOG_INTERVAL);

  // start application
  appLogger.log('starting application...');
  await app.listen(config.application.port);
}
bootstrap();
