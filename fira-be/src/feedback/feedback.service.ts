import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

import { Feedback } from './entity/feedback.entity';
import { User } from '../identity-management/entity/user.entity';
import { SaveFeedback } from './feedback.types';

@Injectable()
export class FeedbackService {
  constructor(private readonly connection: Connection) {}

  public saveFeedback: (userId: string, saveFeedback: SaveFeedback) => void = async (
    userId,
    saveFeedback,
  ) => {
    const user = await this.connection.getRepository(User).findOneOrFail(userId);
    const feedback = new Feedback();
    feedback.status = saveFeedback.status;
    feedback.text = saveFeedback.text;
    feedback.user = user;
    await this.connection.getRepository(Feedback).save(feedback);
  };
}
