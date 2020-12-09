import { Injectable } from '@nestjs/common';

import { BaseDAO } from '../base.dao';
import { failIfNull } from '../persistence.util';
import { PrismaClient } from '@fira-commons/database/prisma';

type ENTITY = 'document';
const ENTITY = 'document';

@Injectable()
export class DocumentsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }

  public findOneOrFail = failIfNull(this.findOne);
}
