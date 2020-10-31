import * as z from 'zod';

export const loginRequestSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().nonempty(),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const refreshRequestSchema = z.object({ refreshToken: z.string().nonempty() });
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;

const authResponseSchema = z.object({
  accessToken: z.string().nonempty(),
  refreshToken: z.string().nonempty(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
