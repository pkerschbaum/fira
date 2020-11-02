import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

import { BaseDAO } from '../base.dao';

type ENTITY = 'query_version';
const ENTITY = 'query_version';

@Injectable()
export class QueryVersionsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }
}
