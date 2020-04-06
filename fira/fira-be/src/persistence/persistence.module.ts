import { Module, Global } from '@nestjs/common';

import { PersistenceService } from './persistence.service';
import { CommonsModule } from '../commons/commons.module';

@Global()
@Module({
  imports: [CommonsModule],
  providers: [PersistenceService],
  exports: [PersistenceService],
})
export class PersistenceModule {}
