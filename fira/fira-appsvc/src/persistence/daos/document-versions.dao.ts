import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

import { BaseDAO } from '../base.dao';

type ENTITY = 'document_version';
const ENTITY = 'document_version';

@Injectable()
export class DocumentVersionsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }
}
