import * as z from 'zod';

export enum JudgementMode {
  PLAIN_RELEVANCE_SCORING = 'PLAIN_RELEVANCE_SCORING',
  SCORING_AND_SELECT_SPANS = 'SCORING_AND_SELECT_SPANS',
}
export const judgementModeSchema = z.nativeEnum(JudgementMode);

export enum RelevanceLevel {
  NOT_RELEVANT = '0_NOT_RELEVANT',
  TOPIC_RELEVANT_DOES_NOT_ANSWER = '1_TOPIC_RELEVANT_DOES_NOT_ANSWER',
  GOOD_ANSWER = '2_GOOD_ANSWER',
  PERFECT_ANSWER = '3_PERFECT_ANSWER',
  MISLEADING_ANSWER = '-1_MISLEADING_ANSWER',
}
const relevanceLevelSchema = z.nativeEnum(RelevanceLevel);

export const preloadJudgementSchema = z.object({
  id: z.number(),
  docAnnotationParts: z.array(z.string()),
  queryText: z.string(),
  mode: judgementModeSchema,
});
export type PreloadJudgement = z.infer<typeof preloadJudgementSchema>;

const preloadJudgementResponseSchema = z.object({
  judgements: z.array(preloadJudgementSchema),
  alreadyFinished: z.number(),
  remainingToFinish: z.number(),
  remainingUntilFirstFeedbackRequired: z.number(),
  countOfFeedbacks: z.number(),
  countOfNotPreloadedPairs: z.number(),
});
export type PreloadJudgementResponse = z.infer<typeof preloadJudgementResponseSchema>;

const loadJudgementsOfUserResponseSchema = z.object({
  judgements: z.array(z.object({ id: z.number(), nr: z.number() })),
});
export type LoadJugementsOfUserResponse = z.infer<typeof loadJudgementsOfUserResponseSchema>;

const loadJudgementResponseSchema = z.object({
  id: z.number(),
  queryText: z.string(),
  documentText: z.string(),
  relevanceLevel: relevanceLevelSchema,
});
export type LoadJudgementResponse = z.infer<typeof loadJudgementResponseSchema>;

export const saveJudgementSchema = z.object({
  relevanceLevel: relevanceLevelSchema,
  relevancePositions: z.array(z.number()),
  durationUsedToJudgeMs: z.number(),
});
export type SaveJudgement = z.infer<typeof saveJudgementSchema>;

const exportJudgementSchema = z.object({
  id: z.number(),
  relevanceLevel: relevanceLevelSchema,
  relevanceCharacterRanges: z.array(z.object({ startChar: z.number(), endChar: z.number() })),
  rotate: z.boolean(),
  mode: judgementModeSchema,
  durationUsedToJudgeMs: z.number(),
  judgedAtUnixTS: z.number(),
  documentId: z.string(),
  queryId: z.string(),
  userId: z.string(),
});
export type ExportJudgement = z.infer<typeof exportJudgementSchema>;
