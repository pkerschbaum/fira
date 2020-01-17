export type PreloadJudgementResponse = {
  readonly judgements: PreloadJudgement[];
  readonly remainingToFinish: number;
};

export type PreloadJudgement = {
  readonly id: number;
  readonly docAnnotationParts: string[];
  readonly queryText: string;
  readonly mode: JudgementMode;
};

export type CountResult = {
  count: number;
  document_id: number;
  priority: number;
  query_id: number;
};

export type SaveJudgement = {
  readonly relevanceLevel: RelevanceLevel;
  readonly relevancePositions: number[];
  readonly durationUsedToJudgeMs: number;
};

export enum JudgementStatus {
  TO_JUDGE = 'TO_JUDGE',
  JUDGED = 'JUDGED',
}

export enum RelevanceLevel {
  NOT_RELEVANT = '0_NOT_RELEVANT',
  TOPIC_RELEVANT_DOES_NOT_ANSWER = '1_TOPIC_RELEVANT_DOES_NOT_ANSWER',
  GOOD_ANSWER = '2_GOOD_ANSWER',
  PERFECT_ANSWER = '3_PERFECT_ANSWER',
  MISLEADING_ANSWER = '-1_MISLEADING_ANSWER',
}

export enum JudgementMode {
  PLAIN_RELEVANCE_SCORING = 'PLAIN_RELEVANCE_SCORING',
  SCORING_AND_SELECT_SPANS = 'SCORING_AND_SELECT_SPANS',
}
