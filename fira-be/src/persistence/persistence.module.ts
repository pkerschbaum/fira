import { Module, Global } from '@nestjs/common';
import { PersistenceService } from './persistence.service';

@Global()
@Module({
  providers: [PersistenceService],
  exports: [PersistenceService],
})
export class PersistenceModule {}
