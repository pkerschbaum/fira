import { createAction, createReducer } from '@reduxjs/toolkit';
import { PreloadJudgement } from '../../typings/typings';
import { RelevanceLevel, RateLevels } from '../../typings/enums';

type JudgementPair = PreloadJudgement & {
  readonly relevanceLevel?: RelevanceLevel;
  readonly currentAnnotationStart?: number;
  readonly annotatedRanges: Array<{ start: number; end: number }>;
};

type AnnotationState = {
  readonly judgementPairs: JudgementPair[];
  readonly remainingToFinish?: number;
  readonly currentJudgementPairId?: PreloadJudgement['id'];
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
      state.remainingToFinish = action.payload.remainingToFinish;

      const judgementPairsReceived = action.payload.judgements;

      if (
        !judgementPairsReceived.some(judgement => judgement.id === state.currentJudgementPairId)
      ) {
        state.currentJudgementPairId = undefined;
      }

      const currentJudgementPair = state.judgementPairs.find(
        pair => pair.id === state.currentJudgementPairId,
      );
      state.judgementPairs = judgementPairsReceived.map(judgement => {
        if (
          currentJudgementPair &&
          currentJudgementPair.id === judgement.id &&
          areJudgementPairsEqual(currentJudgementPair, judgement)
        ) {
          // keep already annotated ranges for the currently selected judgement pair
          return {
            ...judgement,
            ...currentJudgementPair,
          };
        } else {
          // either this judgement pair received from server is not the currently selected one, or
          // the currently selected one changed significantly
          // --> set no annotated ranges (and thus, possibly discard already annotated ranges)
          return {
            ...judgement,
            annotatedRanges: [],
          };
        }
      });

      if (state.currentJudgementPairId === undefined) {
        state.currentJudgementPairId = state.judgementPairs[0].id;
      }
    })
    .addCase(rateJudgementPair, (state, action) => {
      const currentJudgementPair = state.judgementPairs.find(
        pair => pair.id === state.currentJudgementPairId,
      );
      currentJudgementPair!.relevanceLevel = action.payload.relevanceLevel;
      const currentRateLevel = RateLevels.find(
        rateLevel => rateLevel.relevanceLevel === currentJudgementPair!.relevanceLevel,
      );

      // clear annotated ranges if rating is changed to a level which
      // does not require annotation of ranges
      if (!currentRateLevel!.annotationRequired) {
        currentJudgementPair!.annotatedRanges = [];
      }
    })
    .addCase(selectRangeStartEnd, (state, action) => {
      const currentJudgementPair = state.judgementPairs.find(
        pair => pair.id === state.currentJudgementPairId,
      );
      if (currentJudgementPair!.currentAnnotationStart === undefined) {
        currentJudgementPair!.currentAnnotationStart = action.payload.annotationPartIndex;
      } else {
        const start = currentJudgementPair!.currentAnnotationStart;
        const end = action.payload.annotationPartIndex;
        const actualStart = start < end ? start : end;
        const actualEnd = end > start ? end : start;

        currentJudgementPair!.annotatedRanges.push({
          start: actualStart,
          end: actualEnd,
        });
        currentJudgementPair!.currentAnnotationStart = undefined;
      }
    }),
);

function areJudgementPairsEqual(jp1: PreloadJudgement, jp2: PreloadJudgement) {
  return (
    jp1.queryText === jp2.queryText &&
    jp1.docAnnotationParts.length === jp2.docAnnotationParts.length &&
    !jp1.docAnnotationParts.some((part, index) => jp2.docAnnotationParts[index] !== part)
  );
}

export const actions = { preloadJudgements, rateJudgementPair, selectRangeStartEnd };
export default reducer;
