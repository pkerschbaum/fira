import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, EntityManager, FindConditions } from 'typeorm';

import { TJudgement, Judgement } from './entity/judgement.entity';
import { TUser, User } from './entity/user.entity';
import { JudgementStatus } from '../typings/enums';
import { undefinedIfEmpty } from '../util/objects';

@Injectable()
export class JudgementsDAO {
  constructor(
    @InjectRepository(Judgement)
    private readonly judgementRepository: Repository<Judgement>,
  ) {}

  public findJudgement = async (criteria: {
    judgementId: TJudgement['id'];
    user: User;
  }): Promise<TJudgement | undefined> => {
    return await this.judgementRepository.findOne({
      where: { user: criteria.user, id: criteria.judgementId },
    });
  };

  public findJudgements = async (
    criteria: {
      status?: JudgementStatus;
      user?: TUser;
    },
    transactionalEM?: EntityManager,
  ): Promise<TJudgement[]> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(Judgement)
        : this.judgementRepository;

    const findConditions: Partial<TJudgement> = {};
    if (criteria.status !== undefined) {
      findConditions.status = criteria.status;
    }
    if (criteria.user !== undefined) {
      findConditions.user = criteria.user;
    }

    return await repository.find({
      where: undefinedIfEmpty(findConditions),
    });
  };

  public countJudgements = async (
    criteria: {
      user?: TUser;
      status?: JudgementStatus;
      judgedAt?: { min: Date };
    },
    transactionalEM?: EntityManager,
  ): Promise<number> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(Judgement)
        : this.judgementRepository;

    const findConditions: FindConditions<TJudgement> = {};
    if (criteria.user !== undefined) {
      findConditions.user = criteria.user;
    }
    if (criteria.status !== undefined) {
      findConditions.status = criteria.status;
    }
    if (criteria.judgedAt !== undefined) {
      findConditions.judgedAt = MoreThan(criteria.judgedAt.min);
    }
    return await repository.count({
      where: undefinedIfEmpty(findConditions),
    });
  };

  public countJudgementsGroupByUser = async (criteria: {
    status: JudgementStatus;
    havingCount: { min: number };
  }): Promise<number> => {
    return await this.judgementRepository
      .createQueryBuilder('j')
      .select(`j.user_id AS user, count(*) AS count`)
      .where({ status: criteria.status })
      .groupBy(`j.user_id`)
      .having(`count(*) >= ${criteria.havingCount.min}`)
      .getCount();
  };

  public countJudgementsGroupByRotate = async (transactionalEM?: EntityManager) => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(Judgement)
        : this.judgementRepository;

    return ((await repository
      .createQueryBuilder('j')
      .select('j.rotate, count(j.*)')
      .groupBy('j.rotate')
      .execute()) as Array<{ rotate: boolean; count: string }>).map((elem) => ({
      ...elem,
      count: Number(elem.count),
    }));
  };

  public saveJudgement = async (
    data: Pick<TJudgement, 'status'> &
      Partial<
        Pick<
          TJudgement,
          | 'id'
          | 'relevanceLevel'
          | 'relevancePositions'
          | 'durationUsedToJudgeMs'
          | 'judgedAt'
          | 'rotate'
          | 'mode'
          | 'document'
          | 'query'
          | 'user'
        >
      >,
    transactionalEM?: EntityManager,
  ): Promise<void> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(Judgement)
        : this.judgementRepository;

    const judgement = new Judgement();
    if (data.id !== undefined) {
      judgement.id = data.id;
    }
    if (data.relevanceLevel !== null && data.relevanceLevel !== undefined) {
      judgement.relevanceLevel = data.relevanceLevel;
    }
    judgement.relevancePositions =
      data.relevancePositions && data.relevancePositions.length > 0
        ? data.relevancePositions
        : null;
    if (data.durationUsedToJudgeMs !== undefined) {
      judgement.durationUsedToJudgeMs = data.durationUsedToJudgeMs;
    }
    if (data.judgedAt !== undefined) {
      judgement.judgedAt = data.judgedAt;
    }
    judgement.status = data.status;
    if (data.rotate !== undefined) {
      judgement.rotate = data.rotate;
    }
    if (data.mode !== undefined) {
      judgement.mode = data.mode;
    }
    if (data.document !== undefined) {
      judgement.document = data.document;
    }
    if (data.query !== undefined) {
      judgement.query = data.query;
    }
    if (data.user !== undefined) {
      judgement.user = data.user;
    }
    await repository.save(judgement);
  };
}
