import { Injectable } from '@nestjs/common';

import { JudgementStatus } from '../../typings/enums';
import { PrismaClient } from '../../../../fira-commons/database/prisma';

import { BaseDAO } from '../base.dao';

type ENTITY = 'judgement';
const ENTITY = 'judgement';

@Injectable()
export class JudgementsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }

  public countByUser = async ({
    where,
    havingCount,
  }: {
    where: { status: JudgementStatus };
    havingCount: { min: number };
  }): Promise<number> => {
    return (
      await this.prisma.$queryRaw`
          select j.user_id, count(*) from judgement j 
          where j.status = ${where.status} 
          group by j.user_id 
          having count(*) >= ${havingCount.min}
      `
    ).length;
  };
}
