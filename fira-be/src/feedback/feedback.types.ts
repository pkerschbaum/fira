import { FeedbackScore } from '../typings/enums';

export type SubmitFeedback = {
  score: FeedbackScore;
  text?: string;
};
