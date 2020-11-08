import * as z from 'zod';

import { judgementModeSchema } from './judgements.schema';

export enum ImportStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
export const importStatusSchema = z.nativeEnum(ImportStatus);

export const importAssetSchema = z.object({
  id: z.string().nonempty(),
  text: z.string().nonempty(),
});
export type ImportAsset = z.infer<typeof importAssetSchema>;

const importResultSchema = z.object({
  id: z.string(),
  status: importStatusSchema,
  error: z.string().optional(),
});
export type ImportResult = z.infer<typeof importResultSchema>;

export const importUserRequestSchema = z.object({ id: z.string().nonempty() });
export type ImportUserRequest = z.infer<typeof importUserRequestSchema>;

const importUserResponseSchema = z.object({
  id: z.string(),
  status: importStatusSchema,
  username: z.string().optional(),
  password: z.string().optional(),
  error: z.string().optional(),
});
export type ImportUserResponse = z.infer<typeof importUserResponseSchema>;

export const importJudgementPairSchema = z.object({
  documentId: z.string().nonempty(),
  queryId: z.string().nonempty(),
  priority: z.string().nonempty(),
});
export type ImportJudgementPair = z.infer<typeof importJudgementPairSchema>;

const importJudgementPairResultSchema = z.object({
  documentId: z.string(),
  queryId: z.string(),
  status: importStatusSchema,
  error: z.string().optional(),
});
export type ImportJudgementPairResult = z.infer<typeof importJudgementPairResultSchema>;

export const createConfigSchema = z.object({
  annotationTargetPerUser: z.number().int(),
  annotationTargetPerJudgPair: z.number().int(),
  judgementMode: judgementModeSchema,
  rotateDocumentText: z.boolean(),
  annotationTargetToRequireFeedback: z.number().int(),
});
export type CreateConfig = z.infer<typeof createConfigSchema>;

export const updateConfigSchema = z.object({
  annotationTargetPerUser: z.number().int().optional(),
  annotationTargetPerJudgPair: z.number().int().optional(),
  judgementMode: judgementModeSchema.optional(),
  rotateDocumentText: z.boolean().optional(),
  annotationTargetToRequireFeedback: z.number().int().optional(),
});
export type UpdateConfig = z.infer<typeof updateConfigSchema>;

const statisticSchema = z.object({ id: z.string(), label: z.string(), value: z.string() });
export type Statistic = z.infer<typeof statisticSchema>;
