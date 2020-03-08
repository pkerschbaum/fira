import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

import { Feedback } from './entity/feedback.entity';
import { User } from '../identity-management/entity/user.entity';
import { SubmitFeedback } from './feedback.types';

@Injectable()
export class FeedbackService {
  constructor(private readonly connection: Connection) {}

  public submitFeedback: (userId: string, submitFeedback: SubmitFeedback) => void = async (
    userId,
    submitFeedback,
  ) => {
    const user = await this.connection.getRepository(User).findOneOrFail(userId);
    const feedback = new Feedback();
    feedback.score = submitFeedback.score;
    feedback.text = submitFeedback.text;
    feedback.user = user;
    await this.connection.getRepository(Feedback).save(feedback);
  };
}
