import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TFeedback, Feedback } from './entity/feedback.entity';
import { TUser } from './entity/user.entity';
import { failIfUndefined, optionalTransaction, DAO } from './persistence.util';
import { undefinedIfEmpty } from '../util/objects';

@Injectable()
export class FeedbackDAO implements DAO<Feedback> {
  constructor(
    @InjectRepository(Feedback)
    public readonly repository: Repository<Feedback>,
  ) {}

  public findFeedback = async (): Promise<Feedback | undefined> => {
    return this.repository.findOne();
  };

  public findFeedbackOrFail = failIfUndefined(this.findFeedback);

  public findFeedbacks = async (): Promise<Feedback[]> => {
    return await this.repository.find();
  };

  public count = optionalTransaction(Feedback)(
    async ({ criteria }: { criteria?: { user?: TUser } }, repository): Promise<number> => {
      const findConditions: Partial<TFeedback> = {};
      if (criteria?.user !== undefined) {
        findConditions.user = criteria.user;
      }
      return await repository.count({ where: undefinedIfEmpty(findConditions) });
    },
  );

  public saveFeedback = async (
    data: Pick<TFeedback, 'score' | 'user'> & Partial<Pick<TFeedback, 'text'>>,
  ): Promise<void> => {
    const dbEntry = new Feedback();
    dbEntry.score = data.score;
    if (data.text) {
      dbEntry.text = data.text;
    }
    dbEntry.user = data.user;
    await this.repository.save(dbEntry);
  };
}
