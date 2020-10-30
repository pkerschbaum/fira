import { JudgementMode, RelevanceLevel } from '../../fira-commons';

export type PreloadJudgementResponse = {
  readonly judgements: PreloadJudgement[];
  readonly alreadyFinished: number;
  readonly remainingToFinish: number;
  readonly remainingUntilFirstFeedbackRequired: number;
  readonly countOfFeedbacks: number;
  readonly countOfNotPreloadedPairs: number;
};

export type PreloadJudgement = {
  readonly id: number;
  readonly docAnnotationParts: string[];
  readonly queryText: string;
  readonly mode: JudgementMode;
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
  readonly documentId: string;
  readonly queryId: string;
  readonly userId: string;
};
