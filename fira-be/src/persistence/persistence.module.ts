import { Module, Global } from '@nestjs/common';

import { PersistenceService } from './persistence.service';
import { LoggerModule } from '../logger/app-logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [PersistenceService],
  exports: [PersistenceService],
})
export class PersistenceModule {}
