import { Module } from '@nestjs/common';

import { IdentityManagementModule } from '../identity-management/identity-management.module';
import { JudgementsController } from './judgements.controller';
import { JudgementsService } from './judgements.service';
import { JudgementsPreloadWorker } from './judgements-preload.worker';

@Module({
  imports: [IdentityManagementModule],
  controllers: [JudgementsController],
  providers: [JudgementsService, JudgementsPreloadWorker],
  exports: [JudgementsService],
})
export class JudgementsModule {}
