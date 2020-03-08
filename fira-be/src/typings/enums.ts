// fira-be & fira-web shared (duplicated) enums
export enum JudgementMode {
  PLAIN_RELEVANCE_SCORING = 'PLAIN_RELEVANCE_SCORING',
  SCORING_AND_SELECT_SPANS = 'SCORING_AND_SELECT_SPANS',
}

export enum RelevanceLevel {
  NOT_RELEVANT = '0_NOT_RELEVANT',
  TOPIC_RELEVANT_DOES_NOT_ANSWER = '1_TOPIC_RELEVANT_DOES_NOT_ANSWER',
  GOOD_ANSWER = '2_GOOD_ANSWER',
  PERFECT_ANSWER = '3_PERFECT_ANSWER',
  MISLEADING_ANSWER = '-1_MISLEADING_ANSWER',
}

export enum UserAnnotationAction {
  ANNOTATE = 'ANNOTATE',
  SUBMIT_FEEDBACK = 'SUBMIT_FEEDBACK',
}

export enum FeedbackScore {
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  DECENT = 'DECENT',
  DONT_LIKE_IT = 'DONT_LIKE_IT',
}

// fira-be exclusive enums
export enum JudgementStatus {
  TO_JUDGE = 'TO_JUDGE',
  JUDGED = 'JUDGED',
}

export enum ImportStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
