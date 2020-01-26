import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Document, DocumentVersion } from './entity/document.entity';
import { Query, QueryVersion } from './entity/query.entity';
import { JudgementPair } from './entity/judgement-pair.entity';
import { Config } from './entity/config.entity';
import { IdentityManagementModule } from '../identity-management/identity-management.module';
import { JudgementsModule } from 'src/judgements/judgements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      DocumentVersion,
      Query,
      QueryVersion,
      JudgementPair,
      Config,
    ]),
    IdentityManagementModule,
    JudgementsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
