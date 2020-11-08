import {
  config as DbConfig,
  feedback as DbFeedback,
  judgement_pair as DbJudgementPair,
  judgement as DbJudgement,
} from '../../../../fira-commons/database/prisma';

declare module 'knex/types/tables' {
  interface Tables {
    config: DbConfig;
    feedback: DbFeedback;
    judgement_pair: DbJudgementPair;
    judgement: DbJudgement;
  }
}
