import { judgementsSchema } from '@fira-commons';

// fira-web exclusive enums
export enum UserRole {
  ANNOTATOR = 'ANNOTATOR',
  ADMIN = 'ADMIN',
}

export type RateLevelType = {
  readonly relevanceLevel: judgementsSchema.RelevanceLevel;
  readonly annotationRequired: boolean;
  readonly enabled: boolean;
  readonly keyboardKey: {
    toShow: string;
    keyCode: string;
  };
};

export const RateLevels: {
  [level in judgementsSchema.RelevanceLevel]: RateLevelType;
} = {
  [judgementsSchema.RelevanceLevel.NOT_RELEVANT]: {
    relevanceLevel: judgementsSchema.RelevanceLevel.NOT_RELEVANT,
    annotationRequired: false,
    enabled: true,
    keyboardKey: {
      toShow: '1',
      keyCode: 'Digit1',
    },
  },
  [judgementsSchema.RelevanceLevel.MISLEADING_ANSWER]: {
    relevanceLevel: judgementsSchema.RelevanceLevel.MISLEADING_ANSWER,
    annotationRequired: false,
    enabled: false,
    keyboardKey: {
      /* currently disabled */
      toShow: '-1',
      keyCode: '-1',
    },
  },
  [judgementsSchema.RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER]: {
    relevanceLevel: judgementsSchema.RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER,
    annotationRequired: false,
    enabled: true,
    keyboardKey: {
      toShow: '2',
      keyCode: 'Digit2',
    },
  },
  [judgementsSchema.RelevanceLevel.GOOD_ANSWER]: {
    relevanceLevel: judgementsSchema.RelevanceLevel.GOOD_ANSWER,
    annotationRequired: true,
    enabled: true,
    keyboardKey: {
      toShow: '3',
      keyCode: 'Digit3',
    },
  },
  [judgementsSchema.RelevanceLevel.PERFECT_ANSWER]: {
    relevanceLevel: judgementsSchema.RelevanceLevel.PERFECT_ANSWER,
    annotationRequired: true,
    enabled: true,
    keyboardKey: {
      toShow: '4',
      keyCode: 'Digit4',
    },
  },
};
