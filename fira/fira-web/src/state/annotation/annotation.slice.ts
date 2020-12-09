import { createAction, createReducer } from '@reduxjs/toolkit';

import { actions as userActions } from '../user/user.slice';
import { judgementsSchema } from '@fira-commons';

export enum JudgementPairStatus {
  TO_JUDGE = 'TO_JUDGE',
  SEND_PENDING = 'SEND_PENDING',
  SEND_SUCCESS = 'SEND_SUCCESS',
  SEND_FAILED = 'SEND_FAILED',
}

export type JudgementPair = judgementsSchema.PreloadJudgement & {
  readonly relevanceLevel?: judgementsSchema.RelevanceLevel;
  readonly annotatedRanges: Array<{ start: number; end: number }>;
  readonly status: JudgementPairStatus;
};

type AnnotationState = {
  readonly judgementPairs: JudgementPair[];
  readonly alreadyFinished?: number;
  readonly remainingToFinish?: number;
  readonly remainingUntilFirstFeedbackRequired?: number;
  readonly countOfFeedbacks?: number;
  readonly countOfNotPreloadedPairs?: number;
};

type PreloadJudgementsPayload = {
  readonly judgements: judgementsSchema.PreloadJudgement[];
  readonly alreadyFinished: number;
  readonly remainingToFinish: number;
  readonly remainingUntilFirstFeedbackRequired: number;
  readonly countOfFeedbacks: number;
  readonly countOfNotPreloadedPairs: number;
};

type SetJudgementStatusPayload = {
  readonly id: judgementsSchema.PreloadJudgement['id'];
  readonly status: JudgementPairStatus;
};

const INITIAL_STATE = { judgementPairs: [] } as AnnotationState;

export const actions = {
  preloadJudgements: createAction<PreloadJudgementsPayload>('JUDGEMENTS_PRELOADED'),
  setJudgementStatus: createAction<SetJudgementStatusPayload>('JUDGEMENT_STATUS_SET'),
};
export const reducer = createReducer(INITIAL_STATE, (builder) =>
  builder
    .addCase(actions.preloadJudgements, (state, action) => {
      state.alreadyFinished = action.payload.alreadyFinished;
      state.remainingToFinish = action.payload.remainingToFinish;
      state.remainingUntilFirstFeedbackRequired =
        action.payload.remainingUntilFirstFeedbackRequired;
      state.countOfFeedbacks = action.payload.countOfFeedbacks;
      state.countOfNotPreloadedPairs = action.payload.countOfNotPreloadedPairs;

      const judgementPairsReceived = action.payload.judgements;

      state.judgementPairs = judgementPairsReceived.map((judgement) => {
        const localEquivalentPair = state.judgementPairs.find((pair) => pair.id === judgement.id);
        if (localEquivalentPair && areJudgementPairsEqual(localEquivalentPair, judgement)) {
          // keep local data of judgement pair
          return {
            ...judgement,
            ...localEquivalentPair,
          };
        } else {
          // either there is no local data for this judgement pair received from server, or
          // the data of the pair changed significantly
          // --> do not keep local data for this pair
          return {
            ...judgement,
            annotatedRanges: [],
            status: JudgementPairStatus.TO_JUDGE,
          };
        }
      });
    })
    .addCase(actions.setJudgementStatus, (state, action) => {
      const judgementPair = state.judgementPairs.find((pair) => pair.id === action.payload.id);
      if (judgementPair !== undefined) {
        judgementPair.status = action.payload.status;
      }
    })
    .addCase(userActions.logout, () => {
      // on logout, erase annotation state
      return INITIAL_STATE;
    }),
);

function areJudgementPairsEqual(
  jp1: judgementsSchema.PreloadJudgement,
  jp2: judgementsSchema.PreloadJudgement,
) {
  return (
    jp1.queryText === jp2.queryText &&
    jp1.docAnnotationParts.length === jp2.docAnnotationParts.length &&
    !jp1.docAnnotationParts.some((part, index) => jp2.docAnnotationParts[index] !== part)
  );
}
