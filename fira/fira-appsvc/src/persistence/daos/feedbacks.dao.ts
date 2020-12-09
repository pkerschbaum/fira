import { Injectable } from '@nestjs/common';

import { BaseDAO } from '../base.dao';
import { PrismaClient } from '@fira-commons/database/prisma';

type ENTITY = 'feedback';
const ENTITY = 'feedback';

@Injectable()
export class FeedbacksDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }
}
