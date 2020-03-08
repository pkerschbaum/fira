export type PreloadJudgementResponse = {
  readonly judgements: PreloadJudgement[];
  readonly alreadyFinished: number;
  readonly remainingToFinish: number;
  readonly requiredUserAction: UserAnnotationAction;
};

export type PreloadJudgement = {
  readonly id: number;
  readonly docAnnotationParts: string[];
  readonly queryText: string;
  readonly mode: JudgementMode;
};

export type CountResult = {
  readonly count: number;
  readonly document_id: number;
  readonly priority: number;
  readonly query_id: number;
};

export type SaveJudgement = {
  readonly relevanceLevel: RelevanceLevel;
  readonly relevancePositions: number[];
  readonly durationUsedToJudgeMs: number;
};

export type ExportJudgementsResponse = {
  readonly judgements: ExportJudgement[];
};

export type ExportJudgement = {
  readonly id: number;
  readonly relevanceLevel: RelevanceLevel;
  readonly relevanceCharacterRanges: Array<{ startChar: number; endChar: number }>;
  readonly rotate: boolean;
  readonly mode: JudgementMode;
  readonly durationUsedToJudgeMs: number;
  readonly judgedAtUnixTS: number;
  readonly documentId: number;
  readonly queryId: number;
  readonly userId: string;
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

export enum UserAnnotationAction {
  ANNOTATE = 'ANNOTATE',
  SUBMIT_FEEDBACK = 'SUBMIT_FEEDBACK',
}
