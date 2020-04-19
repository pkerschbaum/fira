import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PersistenceService } from './persistence.service';
import { CommonsModule } from '../commons/commons.module';

import { ConfigDAO } from './config.dao';
import { UserDAO } from './user.dao';
import { DocumentDAO } from './document.dao';
import { QueryDAO } from './query.dao';
import { JudgementsDAO } from './judgements.dao';
import { JudgementPairDAO } from './judgement-pair.dao';
import { FeedbackDAO } from './feedback.dao';

import { Config } from './entity/config.entity';
import { User } from './entity/user.entity';
import { Document, DocumentVersion } from './entity/document.entity';
import { Query, QueryVersion } from './entity/query.entity';
import { Judgement } from './entity/judgement.entity';
import { JudgementPair } from './entity/judgement-pair.entity';
import { Feedback } from './entity/feedback.entity';

@Global()
@Module({
  imports: [
    CommonsModule,
    TypeOrmModule.forFeature([
      Config,
      User,
      Document,
      DocumentVersion,
      Query,
      QueryVersion,
      Judgement,
      JudgementPair,
      Feedback,
    ]),
  ],
  providers: [
    PersistenceService,
    ConfigDAO,
    UserDAO,
    DocumentDAO,
    QueryDAO,
    JudgementsDAO,
    JudgementPairDAO,
    FeedbackDAO,
  ],
  exports: [
    PersistenceService,
    ConfigDAO,
    UserDAO,
    DocumentDAO,
    QueryDAO,
    JudgementsDAO,
    JudgementPairDAO,
    FeedbackDAO,
  ],
})
export class PersistenceModule {}
