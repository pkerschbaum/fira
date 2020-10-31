import { Injectable } from '@nestjs/common';
import d3 = require('d3');

import { FeedbackDAO } from '../persistence/feedback.dao';
import { UserDAO } from '../persistence/user.dao';
import { feedbackSchema } from '../../../fira-commons';

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackDAO: FeedbackDAO, private readonly userDAO: UserDAO) {}

  public submitFeedback = async (
    userId: string,
    submitFeedback: feedbackSchema.SubmitFeedback,
  ): Promise<void> => {
    const user = await this.userDAO.findUserOrFail({ criteria: { id: userId } });
    await this.feedbackDAO.saveFeedback({
      score: submitFeedback.score,
      text: submitFeedback.text,
      user,
    });
  };

  private exportFeedback = async (): Promise<feedbackSchema.ExportFeedback[]> => {
    const dbFeedbacks = await this.feedbackDAO.findFeedbacks();
    return dbFeedbacks.map((feedback) => ({
      id: feedback.id,
      score: feedback.score,
      text: feedback.text ?? undefined,
      userId: feedback.user.id,
    }));
  };

  public exportFeedbackTsv = async (): Promise<string> => {
    return d3.tsvFormat(await this.exportFeedback());
  };
}
