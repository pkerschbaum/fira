import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JudgementsController } from './judgements.controller';
import { JudgementsService } from './judgements.service';
import { JudgementsWorkerService } from './judgements-worker.service';
import { Judgement } from './entity/judgement.entity';
import { User } from '../identity-management/entity/user.entity';
import { IdentityManagementModule } from '../identity-management/identity-management.module';

@Module({
  imports: [TypeOrmModule.forFeature([Judgement, User]), IdentityManagementModule],
  controllers: [JudgementsController],
  providers: [JudgementsService, JudgementsWorkerService],
  exports: [JudgementsService],
})
export class JudgementsModule {}
