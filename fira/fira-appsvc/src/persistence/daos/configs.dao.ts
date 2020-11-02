import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

import { BaseDAO } from '../base.dao';
import { failIfNull } from '../persistence.util';

type ENTITY = 'config';
const ENTITY = 'config';

@Injectable()
export class ConfigsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }

  public findFirstOrFail = failIfNull(this.findFirst);
}
