import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import d3 = require('d3');

import { Feedback } from './entity/feedback.entity';
import { User } from '../identity-management/entity/user.entity';
import { SubmitFeedback, ExportFeedback } from './feedback.types';

@Injectable()
export class FeedbackService {
  constructor(private readonly connection: Connection) {}

  public submitFeedback = async (userId: string, submitFeedback: SubmitFeedback): Promise<void> => {
    const user = await this.connection.getRepository(User).findOneOrFail(userId);
    const feedback = new Feedback();
    feedback.score = submitFeedback.score;
    feedback.text = submitFeedback.text;
    feedback.user = user;
    await this.connection.getRepository(Feedback).save(feedback);
  };

  private exportFeedback = async (): Promise<ExportFeedback[]> => {
    const dbFeedback = await this.connection.getRepository(Feedback).find();
    return dbFeedback.map((feedback) => ({
      id: feedback.id,
      score: feedback.score,
      text: feedback.text,
      userId: feedback.user.id,
    }));
  };

  public exportFeedbackTsv = async (): Promise<string> => {
    return d3.tsvFormat(await this.exportFeedback());
  };
}
