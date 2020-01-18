import { createAction, createReducer } from '@reduxjs/toolkit';
import { PreloadJudgement } from '../typings/typings';
import { RelevanceLevel } from '../typings/enums';

type JudgementRating = {
  readonly relevanceLevel?: RelevanceLevel;
  readonly annotatedParts: PreloadJudgement['docAnnotationParts'];
};

type AnnotationState = {
  readonly judgementPairs: Array<PreloadJudgement & JudgementRating>;
  readonly remainingToFinish?: number;
};

type PreloadJudgementsPayload = {
  readonly judgements: PreloadJudgement[];
  readonly remainingToFinish: number;
};

type RateJudgementPairPayload = {
  readonly id: PreloadJudgement['id'];
  readonly relevanceLevel: RelevanceLevel;
};

const INITIAL_STATE = { judgementPairs: [] } as AnnotationState;

const preloadJudgements = createAction<PreloadJudgementsPayload>('JUDGEMENTS_PRELOADED');
const rateJudgementPair = createAction<RateJudgementPairPayload>('JUDGEMENT_PAIR_RATED');

const reducer = createReducer(INITIAL_STATE, builder =>
  builder
    .addCase(preloadJudgements, (state, action) => {
      state.judgementPairs = action.payload.judgements.map(judgement => ({
        ...judgement,
        annotatedParts: [],
      }));
      state.remainingToFinish = action.payload.remainingToFinish;
    })
    .addCase(rateJudgementPair, (state, action) => {
      const judgementPairToRate = state.judgementPairs.find(
        judgement => judgement.id === action.payload.id,
      );

      if (!judgementPairToRate) {
        throw new Error(
          `judgement pair could not be rated, id not found, action payload: ${JSON.stringify(
            action.payload,
          )}`,
        );
      }

      judgementPairToRate.relevanceLevel = action.payload.relevanceLevel;
    }),
);

export const actions = { preloadJudgements, rateJudgementPair };
export default reducer;
