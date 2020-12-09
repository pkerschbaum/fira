import { Injectable } from '@nestjs/common';
import d3 = require('d3');

import { FeedbacksDAO } from '../persistence/daos/feedbacks.dao';
import { feedbackSchema } from '@fira-commons';

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbacksDAO: FeedbacksDAO) {}

  public submitFeedback = async (
    userId: string,
    submitFeedback: feedbackSchema.SubmitFeedback,
  ): Promise<void> => {
    await this.feedbacksDAO.create({
      data: {
        score: submitFeedback.score,
        text: submitFeedback.text,
        user: { connect: { id: userId } },
      },
    });
  };

  private exportFeedback = async (): Promise<feedbackSchema.ExportFeedback[]> => {
    const dbFeedbacks = await this.feedbacksDAO.findMany();
    return dbFeedbacks.map((feedback) => ({
      id: feedback.id,
      score: feedback.score as feedbackSchema.FeedbackScore,
      text: feedback.text ?? undefined,
      userId: feedback.user_id,
    }));
  };

  public exportFeedbackTsv = async (): Promise<string> => {
    return d3.tsvFormat(await this.exportFeedback());
  };
}
