import { Injectable } from '@nestjs/common';

import { BaseDAO } from '../base.dao';
import { JudgementStatus } from '../../typings/enums';
import { transactional } from '../persistence.util';
import { judgement, PrismaClient } from '../../../../fira-commons/database/prisma';

type ENTITY = 'judgement';
const ENTITY = 'judgement';

@Injectable()
export class JudgementsDAO extends BaseDAO<ENTITY> {
  constructor(prisma: PrismaClient) {
    super(ENTITY, prisma);
  }

  public createTrx = transactional(
    async ({ data }: { data: Omit<judgement, 'id' | 'created_at' | 'updated_at'> }, trx) => {
      await trx(`judgement`).insert(data);
    },
  );

  public countByUser = async ({
    where,
    havingCount,
  }: {
    where: { status: JudgementStatus };
    havingCount: { min: number };
  }): Promise<number> => {
    return (
      await this.prisma.$queryRaw`
          select "j"."user_id", count(*) from judgement j 
          where "j"."status" = ${where.status} 
          group by "j"."user_id" 
          having count(*) >= ${havingCount.min}
      `
    ).length;
  };

  public countJudgementsGroupByRotate = transactional(async (_, trx) => {
    return ((await trx(`judgement`)
      .select('rotate', trx.raw('count("judgement".*)'))
      .groupBy('rotate')) as Array<{ rotate: boolean; count: string }>).map((elem) => ({
      ...elem,
      count: Number(elem.count),
    }));
  });
}
