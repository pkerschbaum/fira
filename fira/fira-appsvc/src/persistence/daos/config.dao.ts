import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

import { BaseDAO } from '../base.dao';

type ENTITY = 'config';
const ENTITY = 'config';

@Injectable()
export class ConfigDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }

  public findOrFail = async () => {
    const configs = await this.findMany({ take: 1 });
    if (configs.length < 1) {
      throw new Error(`entity not found`);
    }
    return configs[0];
  };
}
