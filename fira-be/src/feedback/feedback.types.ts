export type SaveFeedback = {
  status: FeedbackScore;
  text?: string;
};

export enum FeedbackScore {
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  DECENT = 'DECENT',
  DONT_LIKE_IT = 'DONT_LIKE_IT',
}
