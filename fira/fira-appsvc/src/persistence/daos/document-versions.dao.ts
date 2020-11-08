import { Injectable } from '@nestjs/common';

import { BaseDAO } from '../base.dao';
import { failIfNull } from '../persistence.util';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

type ENTITY = 'document_version';
const ENTITY = 'document_version';

@Injectable()
export class DocumentVersionsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }

  public findOneOrFail = failIfNull(this.findOne);
}
