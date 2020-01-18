export enum RelevanceLevel {
  NOT_RELEVANT = '0_NOT_RELEVANT',
  TOPIC_RELEVANT_DOES_NOT_ANSWER = '1_TOPIC_RELEVANT_DOES_NOT_ANSWER',
  GOOD_ANSWER = '2_GOOD_ANSWER',
  PERFECT_ANSWER = '3_PERFECT_ANSWER',
  MISLEADING_ANSWER = '-1_MISLEADING_ANSWER',
}

export const RateLevels = [
  {
    text: 'Misleading Answer',
    relevanceLevel: RelevanceLevel.MISLEADING_ANSWER,
    annotationRequired: false,
  },
  { text: 'Not Relevant', relevanceLevel: RelevanceLevel.NOT_RELEVANT, annotationRequired: false },
  {
    text: 'Topic Relevant, But Does Not Answer',
    relevanceLevel: RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER,
    annotationRequired: true,
  },
  { text: 'Good Answer', relevanceLevel: RelevanceLevel.GOOD_ANSWER, annotationRequired: true },
  {
    text: 'Perfect Answer',
    relevanceLevel: RelevanceLevel.PERFECT_ANSWER,
    annotationRequired: true,
  },
] as const;
