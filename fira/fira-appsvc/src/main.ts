import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';

import * as config from './config';
import { AppModule } from './app.module';
import { TransientLogger } from './commons/logger/transient-logger';
import { baseLogger } from './commons/logger/base-logger';
import { importInitialData } from './boot/import-initial-data';
import { IdentityManagementService } from './identity-management/identity-management.service';
import { AdminService } from './admin/admin.service';

const RUNNING_LOG_INTERVAL = 1000; // ms

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: {
      log: (message, context) => baseLogger.log(message, undefined, { component: context }),
      debug: (message, context) => baseLogger.debug(message, undefined, { component: context }),
      warn: (message, context) => baseLogger.warn(message, undefined, { component: context }),
      error: (message, trace, context) =>
        baseLogger.error(message, trace, undefined, { component: context }),
      verbose: (message, context) => baseLogger.verbose(message, undefined, { component: context }),
    },
  });
  const appLogger = await app.resolve(TransientLogger);
  appLogger.setComponent('Main-Bootstrap');

  // enable gzip compression
  app.use(compression());

  // set global prefix which is applied to all HTTP endpoints and the Swagger UI, but not to
  // the static path the web app is served with
  app.setGlobalPrefix(`${config.application.urlPaths.web}${config.application.urlPaths.api}`);

  // now, import all data for Fira
  await importInitialData({
    logger: appLogger,
    imService: await app.resolve(IdentityManagementService),
    adminService: await app.resolve(AdminService),
  });

  // set up Swagger doc and UI
  appLogger.log('setting up swagger module...');
  const options = new DocumentBuilder()
    .setTitle('fira app service')
    .setDescription('The fira app service API description')
    .setVersion(config.application.version)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // schedule logging
  setInterval(() => {
    appLogger.log('server is running');
  }, RUNNING_LOG_INTERVAL);

  // start application
  appLogger.log('starting application...', { port: config.application.port });
  await app.listen(config.application.port);
}
void bootstrap();
