import { RelevanceLevel } from '../../../fira-commons';

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
