import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JudgementsController } from './judgements.controller';
import { JudgementsService } from './judgements.service';
import { Judgement } from './entity/judgement.entity';
import { User } from '../identity-management/entity/user.entity';
import { IdentityManagementModule } from '../identity-management/identity-management.module';
import { LoggerModule } from '../logger/app-logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Judgement, User]), IdentityManagementModule, LoggerModule],
  controllers: [JudgementsController],
  providers: [JudgementsService],
  exports: [JudgementsService],
})
export class JudgementsModule {}
