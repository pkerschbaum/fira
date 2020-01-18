import { createAction, createReducer } from '@reduxjs/toolkit';
import { PreloadJudgement } from '../typings';

type AnnotationState = {
  readonly preloadedJudgements: PreloadJudgement[];
  readonly remainingToFinish?: number;
};

type PreloadJudgementsPayload = {
  readonly judgements: PreloadJudgement[];
  readonly remainingToFinish: number;
};

const INITIAL_STATE = { preloadedJudgements: [] } as AnnotationState;

const preloadJudgements = createAction<PreloadJudgementsPayload>('JUDGEMENTS_PRELOADED');
const reducer = createReducer(INITIAL_STATE, builder =>
  builder.addCase(preloadJudgements, (state, action) => {
    state.preloadedJudgements = action.payload.judgements;
    state.remainingToFinish = action.payload.remainingToFinish;
  }),
);

export const actions = { preloadJudgements };
export default reducer;
