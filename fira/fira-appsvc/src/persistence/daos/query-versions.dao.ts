import { Injectable } from '@nestjs/common';

import { BaseDAO } from '../base.dao';
import { failIfNull } from '../persistence.util';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

type ENTITY = 'query_version';
const ENTITY = 'query_version';

@Injectable()
export class QueryVersionsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }

  public findOneOrFail = failIfNull(this.findOne);
}
