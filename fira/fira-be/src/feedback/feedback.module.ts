import { Module } from '@nestjs/common';

import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { IdentityManagementModule } from '../identity-management/identity-management.module';

@Module({
  imports: [IdentityManagementModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
