import { Module } from '@nestjs/common';

import { IdentityManagementModule } from '../identity-management/identity-management.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [IdentityManagementModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
