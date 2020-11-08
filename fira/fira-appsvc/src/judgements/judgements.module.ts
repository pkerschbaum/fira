import { Module } from '@nestjs/common';

import { IdentityManagementModule } from '../identity-management/identity-management.module';
import { JudgementsController } from './judgements.controller';
import { JudgementsService } from './judgements.service';

@Module({
  imports: [IdentityManagementModule],
  controllers: [JudgementsController],
  providers: [JudgementsService],
  exports: [JudgementsService],
})
export class JudgementsModule {}
