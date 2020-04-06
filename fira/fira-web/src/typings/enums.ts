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
  readonly relevanceLevel: RelevanceLevel;
  readonly annotationRequired: boolean;
  readonly enabled: boolean;
  readonly keyboardKey: {
    toShow: string;
    keyCode: string;
  };
};

export const RateLevels: {
  [level in RelevanceLevel]: RateLevelType;
} = {
  [RelevanceLevel.NOT_RELEVANT]: {
    relevanceLevel: RelevanceLevel.NOT_RELEVANT,
    annotationRequired: false,
    enabled: true,
    keyboardKey: {
      toShow: '1',
      keyCode: 'Digit1',
    },
  },
  [RelevanceLevel.MISLEADING_ANSWER]: {
    relevanceLevel: RelevanceLevel.MISLEADING_ANSWER,
    annotationRequired: false,
    enabled: false,
    keyboardKey: {
      /* currently disabled */
      toShow: '-1',
      keyCode: '-1',
    },
  },
  [RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER]: {
    relevanceLevel: RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER,
    annotationRequired: false,
    enabled: true,
    keyboardKey: {
      toShow: '2',
      keyCode: 'Digit2',
    },
  },
  [RelevanceLevel.GOOD_ANSWER]: {
    relevanceLevel: RelevanceLevel.GOOD_ANSWER,
    annotationRequired: true,
    enabled: true,
    keyboardKey: {
      toShow: '3',
      keyCode: 'Digit3',
    },
  },
  [RelevanceLevel.PERFECT_ANSWER]: {
    relevanceLevel: RelevanceLevel.PERFECT_ANSWER,
    annotationRequired: true,
    enabled: true,
    keyboardKey: {
      toShow: '4',
      keyCode: 'Digit4',
    },
  },
};
