import { createAction, createReducer } from '@reduxjs/toolkit';
import { PreloadJudgement } from '../../typings/typings';
import { RelevanceLevel } from '../../typings/enums';

type JudgementPair = PreloadJudgement & {
  readonly relevanceLevel?: RelevanceLevel;
  readonly annotatedRanges: Array<{ start: number; end: number }>;
};

type AnnotationState = {
  readonly judgementPairs: JudgementPair[];
  readonly remainingToFinish?: number;
  readonly currentJudgementPairId?: PreloadJudgement['id'];
  readonly currentAnnotationStart?: number;
};

type PreloadJudgementsPayload = {
  readonly judgements: PreloadJudgement[];
  readonly remainingToFinish: number;
};

type RateJudgementPairPayload = {
  readonly relevanceLevel: RelevanceLevel;
};

type SelectRangeStartEndPayload = {
  readonly annotationPartIndex: number;
};

const INITIAL_STATE = { judgementPairs: [] } as AnnotationState;

const preloadJudgements = createAction<PreloadJudgementsPayload>('JUDGEMENTS_PRELOADED');
const rateJudgementPair = createAction<RateJudgementPairPayload>('JUDGEMENT_PAIR_RATED');
const selectRangeStartEnd = createAction<SelectRangeStartEndPayload>('RANGE_STARTOREND_SELECTED');

const reducer = createReducer(INITIAL_STATE, builder =>
  builder
    .addCase(preloadJudgements, (state, action) => {
      state.judgementPairs = action.payload.judgements.map(judgement => ({
        ...judgement,
        annotatedRanges: [],
      }));
      state.remainingToFinish = action.payload.remainingToFinish;
      state.currentJudgementPairId =
        state.judgementPairs.length < 1 ? undefined : state.judgementPairs[0].id;
    })
    .addCase(rateJudgementPair, (state, action) => {
      const currentJudgementPair = state.judgementPairs.find(
        pair => pair.id === state.currentJudgementPairId,
      );
      currentJudgementPair!.relevanceLevel = action.payload.relevanceLevel;
    })
    .addCase(selectRangeStartEnd, (state, action) => {
      if (state.currentAnnotationStart === undefined) {
        state.currentAnnotationStart = action.payload.annotationPartIndex;
      } else {
        const start = state.currentAnnotationStart;
        const end = action.payload.annotationPartIndex;
        const actualStart = start < end ? start : end;
        const actualEnd = end > start ? end : start;

        const currentJudgementPair = state.judgementPairs.find(
          pair => pair.id === state.currentJudgementPairId,
        );
        currentJudgementPair!.annotatedRanges.push({
          start: actualStart,
          end: actualEnd,
        });
        state.currentAnnotationStart = undefined;
      }
    }),
);

export const actions = { preloadJudgements, rateJudgementPair, selectRangeStartEnd };
export default reducer;
