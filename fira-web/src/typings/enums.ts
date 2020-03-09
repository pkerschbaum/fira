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

// fira-web exclusive enums
export enum UserRole {
  ANNOTATOR = 'ANNOTATOR',
  ADMIN = 'ADMIN',
}

export type RateLevelType = {
  readonly text: string;
  readonly relevanceLevel: RelevanceLevel;
  readonly annotationRequired: boolean;
};

export const RateLevels: RateLevelType[] = [
  {
    text: 'Misleading Answer',
    relevanceLevel: RelevanceLevel.MISLEADING_ANSWER,
    annotationRequired: false,
  },
  {
    text: 'Not Relevant',
    relevanceLevel: RelevanceLevel.NOT_RELEVANT,
    annotationRequired: false,
  },
  {
    text: 'Topic Relevant, But Does Not Answer',
    relevanceLevel: RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER,
    annotationRequired: true,
  },
  {
    text: 'Good Answer',
    relevanceLevel: RelevanceLevel.GOOD_ANSWER,
    annotationRequired: true,
  },
  {
    text: 'Perfect Answer',
    relevanceLevel: RelevanceLevel.PERFECT_ANSWER,
    annotationRequired: true,
  },
];
