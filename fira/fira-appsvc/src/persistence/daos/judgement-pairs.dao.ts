import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

import { BaseDAO } from '../base.dao';

type ENTITY = 'judgement_pair';
const ENTITY = 'judgement_pair';

@Injectable()
export class JudgementPairsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }
}
