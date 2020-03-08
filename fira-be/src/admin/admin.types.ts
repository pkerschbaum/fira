import { ImportStatus } from '../typings/commons';
import { JudgementMode } from '../judgements/judgements.types';

export type ImportDocumentsReq = {
  readonly documents: ImportAsset[];
};

export type ImportQueriesReq = {
  readonly queries: ImportAsset[];
};

export type ImportAsset = {
  readonly id: number;
  readonly text: string;
};

export type ImportDocumentsResp = {
  readonly importedDocuments: ImportResult[];
};

export type ImportQueriesResp = {
  readonly importedQueries: ImportResult[];
};

export type ImportResult = {
  readonly id: number;
  readonly status: ImportStatus;
  readonly error?: string;
};

export type ImportJudgementPairsReq = {
  readonly judgementPairs: ImportJudgementPair[];
};

export type ImportJudgementPair = {
  readonly documentId: number;
  readonly queryId: number;
  readonly priority: number;
};

export type ImportJudgementPairsResp = {
  readonly importedJudgementPairs: ImportJudgementPairResult[];
};

export type ImportJudgementPairResult = {
  readonly documentId: number;
  readonly queryId: number;
  readonly status: ImportStatus;
  readonly error?: string;
};

export type UpdateConfig = {
  readonly annotationTargetPerUser?: number;
  readonly annotationTargetPerJudgPair?: number;
  readonly judgementMode?: JudgementMode;
  readonly rotateDocumentText?: boolean;
  readonly annotationTargetToRequireFeedback?: number;
};

export type StatisticsResp = {
  readonly statistics: Statistic[];
};

export type Statistic = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};
