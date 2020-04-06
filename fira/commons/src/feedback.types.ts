import { FeedbackScore } from '../../commons';

export type SubmitFeedback = {
  score: FeedbackScore;
  text?: string;
};

export type ExportFeedbackResponse = {
  readonly feedback: ExportFeedback[];
};

export type ExportFeedback = {
  readonly id: number;
  readonly score: FeedbackScore;
  readonly text?: string;
  readonly userId: string;
};
