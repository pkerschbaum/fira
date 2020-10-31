import { Module } from '@nestjs/common';

import { IdentityManagementModule } from '../identity-management/identity-management.module';
import { JudgementsModule } from '../judgements/judgements.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [IdentityManagementModule, JudgementsModule, FeedbackModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
