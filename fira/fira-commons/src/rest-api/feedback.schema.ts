import * as z from 'zod';

export enum FeedbackScore {
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  DECENT = 'DECENT',
  DONT_LIKE_IT = 'DONT_LIKE_IT',
}
const feedbackScoreSchema = z.nativeEnum(FeedbackScore);

export const submitFeedbackSchema = z.object({
  score: feedbackScoreSchema,
  text: z.string().optional(),
});
export type SubmitFeedback = z.infer<typeof submitFeedbackSchema>;

const exportFeedbackSchema = z.object({
  id: z.number(),
  score: feedbackScoreSchema,
  text: z.string().optional(),
  userId: z.string(),
});
export type ExportFeedback = z.infer<typeof exportFeedbackSchema>;
