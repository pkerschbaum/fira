import * as z from 'zod';

const healthResponseSchema = z.object({
  version: z.string(),
  memory: z.object({ totalMB: z.number(), freeMB: z.number() }),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;
