import * as z from 'zod';

import {
  importAssetSchema,
  ImportJudgementPairResult,
  importJudgementPairSchema,
  ImportResult,
  importUserRequestSchema,
  ImportUserResponse,
  Statistic,
  updateConfigSchema,
} from './admin.schema';
import { AuthResponse, loginRequestSchema, refreshRequestSchema } from './auth.schema';
import { submitFeedbackSchema } from './feedback.schema';
import { PreloadJudgementResponse, saveJudgementSchema } from './judgements.schema';
import { HealthResponse } from './mgmt.schema';
import { NarrowUnion, UnionToIntersection } from '../util/types.util';

export const basePaths = {
  admin: 'admin',
  auth: 'auth',
  feedback: 'feedback',
  judgements: 'judgements',
  mgmt: 'mgmt',
} as const;

export type OrderOptions = 'asc' | 'desc';
export type Query<Shape extends {}> = {
  skip?: number;
  take?: number;
  filter?: {
    [prop in keyof Shape]?: Shape[prop] extends string
      ? { contains: Shape[prop]; mode?: 'insensitive' } | { equals: Shape[prop] }
      : { equals: Shape[prop] };
  };
  orderBy?: { [prop in keyof Shape]?: OrderOptions };
};

export const queryParams = z.object({
  skip: z.union([z.string().nonempty(), z.number()]).optional(),
  take: z.union([z.string().nonempty(), z.number()]).optional(),
  filter: z.union([z.string().nonempty(), z.array(z.string().nonempty())]).optional(),
  orderBy: z.union([z.string().nonempty(), z.array(z.string().nonempty())]).optional(),
});
export type QueryParams = z.infer<typeof queryParams>;

export type ExceptionHandler = {
  condition: (error: any) => boolean;
  exception: (error: any) => Error;
};

// requestor: overload method for each request type to improve typing and autosuggestion
export type Requestor<T extends { type: any; request: any; response: any }> = UnionToIntersection<
  {
    [reqType in T['type']]: (
      request: NarrowUnion<'type', T, reqType>['request'],
      additionalArgs?: {
        exceptionHandlers?: ExceptionHandler[];
        timeout?: number;
      },
    ) => Promise<NarrowUnion<'type', T, reqType>['response']>;
  }[T['type']]
>;

/* admin request/response types */

export const updateConfigReqSchema = z.object({
  type: z.literal('update config'),
  request: z.object({
    url: z.literal('v1/config'),
    method: z.literal('PUT'),
    data: updateConfigSchema,
  }),
});
export type UpdateConfig = z.infer<typeof updateConfigReqSchema> & { response: void };

export const exportJudgementsSchema = z.object({
  type: z.literal('export judgements'),
  request: z.object({
    url: z.literal('v1/judgements/export/tsv'),
    method: z.literal('GET'),
  }),
});
export type ExportJudgements = z.infer<typeof exportJudgementsSchema> & { response: string };

export const exportFeedbackSchema = z.object({
  type: z.literal('export feedback'),
  request: z.object({
    url: z.literal('v1/feedback/export/tsv'),
    method: z.literal('GET'),
  }),
});
export type ExportFeedback = z.infer<typeof exportFeedbackSchema> & { response: string };

export const loadStatisticsSchema = z.object({
  type: z.literal('load statistics'),
  request: z.object({
    url: z.literal('v1/statistics'),
    method: z.literal('GET'),
  }),
});
export type LoadStatistics = z.infer<typeof loadStatisticsSchema> & {
  response: { statistics: Statistic[] };
};

export type AdminReqResp = UpdateConfig | ExportJudgements | ExportFeedback | LoadStatistics;
export type AdminRequestor = Requestor<AdminReqResp>;

/* auth request/response types */

export const loginSchema = z.object({
  type: z.literal('login'),
  request: z.object({
    url: z.literal('v1/login'),
    method: z.literal('POST'),
    data: loginRequestSchema,
  }),
});
export type Login = z.infer<typeof loginSchema> & { response: AuthResponse };

export const refreshSchema = z.object({
  type: z.literal('REFRESH auth'),
  request: z.object({
    url: z.literal('v1/refresh'),
    method: z.literal('POST'),
    data: refreshRequestSchema,
  }),
});
export type Refresh = z.infer<typeof refreshSchema> & { response: AuthResponse };

export type AuthReqRes = Login | Refresh;
export type AuthRequestor = Requestor<AuthReqRes>;

/* feedback request/response types */

export const submitFeedbackReqSchema = z.object({
  type: z.literal('submit feedback'),
  request: z.object({
    url: z.literal('v1'),
    method: z.literal('POST'),
    data: submitFeedbackSchema,
  }),
});
export type SubmitFeedback = z.infer<typeof submitFeedbackReqSchema> & {
  response: void;
};

export type FeedbackReqRes = SubmitFeedback;
export type FeedbackRequestor = Requestor<FeedbackReqRes>;

/* judgements request/response types */

export const preloadJudgementsSchema = z.object({
  type: z.literal('preload judgements'),
  request: z.object({
    url: z.literal('v1/preload'),
    method: z.literal('POST'),
  }),
});
export type PreloadJudgements = z.infer<typeof preloadJudgementsSchema> & {
  response: PreloadJudgementResponse;
};

export const submitJudgementSchema = z.object({
  type: z.literal('submit judgement'),
  request: z.object({
    url: z.literal('v1/:judgementId'),
    method: z.literal('PUT'),
    pathParams: z.object({ judgementId: z.number() }),
    data: saveJudgementSchema,
  }),
});
export type SubmitJudgement = z.infer<typeof submitJudgementSchema> & {
  response: void;
};

export type JudgementsReqRes = PreloadJudgements | SubmitJudgement;
export type JudgementsRequestor = Requestor<JudgementsReqRes>;

/* mgmt (general) request/response types */

export const loadHealthSchema = z.object({
  type: z.literal('load health'),
  request: z.object({
    url: z.literal('v1/health'),
    method: z.literal('GET'),
  }),
});
export type LoadHealth = z.infer<typeof loadHealthSchema> & {
  response: HealthResponse;
};

export type MgmtReqRes = LoadHealth;
export type MgmtRequestor = Requestor<MgmtReqRes>;
