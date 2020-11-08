import { Injectable } from '@nestjs/common';

import { BaseDAO } from '../base.dao';
import { failIfNull } from '../persistence.util';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

type ENTITY = 'config';
const ENTITY = 'config';

@Injectable()
export class ConfigsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }

  public findFirstOrFail = failIfNull(this.findFirst);
}
