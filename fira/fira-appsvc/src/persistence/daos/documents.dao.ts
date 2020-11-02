import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

import { BaseDAO } from '../base.dao';

type ENTITY = 'document';
const ENTITY = 'document';

@Injectable()
export class DocumentsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }
}
