import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { TFeedback, Feedback } from './entity/feedback.entity';
import { TUser } from './entity/user.entity';
import { failIfUndefined } from './persistence.util';
import { undefinedIfEmpty } from '../util/objects';

@Injectable()
export class FeedbackDAO {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  public findFeedback = async (): Promise<Feedback | undefined> => {
    return this.feedbackRepository.findOne();
  };

  public findFeedbackOrFail = failIfUndefined(this.findFeedback);

  public findFeedbacks = async (): Promise<Feedback[]> => {
    return await this.feedbackRepository.find();
  };

  public count = async (
    criteria?: { user?: TUser },
    transactionalEM?: EntityManager,
  ): Promise<number> => {
    const repository = transactionalEM?.getRepository(Feedback) ?? this.feedbackRepository;
    const findConditions: Partial<TFeedback> = {};
    if (criteria?.user !== undefined) {
      findConditions.user = criteria.user;
    }
    return await repository.count({ where: undefinedIfEmpty(findConditions) });
  };

  public saveFeedback = async (
    data: Pick<TFeedback, 'score' | 'user'> & Partial<Pick<TFeedback, 'text'>>,
  ): Promise<void> => {
    const dbEntry = new Feedback();
    dbEntry.score = data.score;
    if (data.text) {
      dbEntry.text = data.text;
    }
    dbEntry.user = data.user;
    await this.feedbackRepository.save(dbEntry);
  };
}
