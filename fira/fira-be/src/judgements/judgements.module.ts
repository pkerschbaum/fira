import { Module } from '@nestjs/common';

import { IdentityManagementModule } from '../identity-management/identity-management.module';
import { JudgementsController } from './judgements.controller';
import { JudgementsService } from './judgements.service';
import { JudgementsWorkerService } from './judgements-worker.service';

@Module({
  imports: [IdentityManagementModule],
  controllers: [JudgementsController],
  providers: [JudgementsService, JudgementsWorkerService],
  exports: [JudgementsService],
})
export class JudgementsModule {}
