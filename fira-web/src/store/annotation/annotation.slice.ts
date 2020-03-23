import { createAction, createReducer } from '@reduxjs/toolkit';

import { PreloadJudgement } from '../../typings/fira-be-typings';
import { RelevanceLevel, RateLevels, UserAnnotationAction } from '../../typings/enums';
import { actions as userActions } from '../user/user.slice';

export enum JudgementPairStatus {
  TO_JUDGE = 'TO_JUDGE',
  SEND_PENDING = 'SEND_PENDING',
  SEND_SUCCESS = 'SEND_SUCCESS',
  SEND_FAILED = 'SEND_FAILED',
}

export type JudgementPair = PreloadJudgement & {
  readonly relevanceLevel?: RelevanceLevel;
  readonly currentAnnotationStart?: number;
  readonly annotatedRanges: Array<{ start: number; end: number }>;
  readonly status: JudgementPairStatus;
};

type AnnotationState = {
  readonly judgementPairs: JudgementPair[];
  readonly alreadyFinished?: number;
  readonly remainingToFinish?: number;
  readonly currentJudgementPairId?: PreloadJudgement['id'];
  readonly currentJudgementPairSelectedOnMs?: number; // unix timestamp
  readonly requiredUserAction?: UserAnnotationAction;
};

type PreloadJudgementsPayload = {
  readonly judgements: PreloadJudgement[];
  readonly alreadyFinished: number;
  readonly remainingToFinish: number;
  readonly requiredUserAction: UserAnnotationAction;
};

type RateJudgementPairPayload = {
  readonly relevanceLevel: RelevanceLevel;
};

type SelectRangeStartEndPayload = {
  readonly annotationPartIndex: number;
};

type DeleteRangePayload = {
  readonly annotationPartIndex: number;
};

type SetJudgementStatusPayload = {
  readonly id: PreloadJudgement['id'];
  readonly status: JudgementPairStatus;
};

const INITIAL_STATE = { judgementPairs: [] } as AnnotationState;

const preloadJudgements = createAction<PreloadJudgementsPayload>('JUDGEMENTS_PRELOADED');
const rateJudgementPair = createAction<RateJudgementPairPayload>('JUDGEMENT_PAIR_RATED');
const selectRangeStartEnd = createAction<SelectRangeStartEndPayload>('RANGE_STARTOREND_SELECTED');
const deleteRange = createAction<DeleteRangePayload>('RANGE_DELETED');
const setJudgementStatus = createAction<SetJudgementStatusPayload>('JUDGEMENT_STATUS_SET');
const selectJudgementPair = createAction<JudgementPair | undefined>('JUDGEMENT_PAIR_SELECTED');

const reducer = createReducer(INITIAL_STATE, (builder) =>
  builder
    .addCase(preloadJudgements, (state, action) => {
      state.alreadyFinished = action.payload.alreadyFinished;
      state.remainingToFinish = action.payload.remainingToFinish;
      state.requiredUserAction = action.payload.requiredUserAction;

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
    .addCase(rateJudgementPair, (state, action) => {
      const currentJudgementPair = state.judgementPairs.find(
        (pair) => pair.id === state.currentJudgementPairId,
      );
      currentJudgementPair!.relevanceLevel = action.payload.relevanceLevel;
      const currentRateLevel = RateLevels.find(
        (rateLevel) => rateLevel.relevanceLevel === currentJudgementPair!.relevanceLevel,
      );

      // clear annotated ranges and current annotation start if
      // rating is changed to a level which does not require annotation of ranges
      if (!currentRateLevel!.annotationRequired) {
        currentJudgementPair!.annotatedRanges = [];
        currentJudgementPair!.currentAnnotationStart = undefined;
      }
    })
    .addCase(selectRangeStartEnd, (state, action) => {
      const currentJudgementPair = state.judgementPairs.find(
        (pair) => pair.id === state.currentJudgementPairId,
      );
      if (currentJudgementPair!.currentAnnotationStart === undefined) {
        // the start of an annotation range was selected --> just save the index
        currentJudgementPair!.currentAnnotationStart = action.payload.annotationPartIndex;
      } else {
        // the end of an annotation range was selected --> save the annotated range
        const start = currentJudgementPair!.currentAnnotationStart;
        const end = action.payload.annotationPartIndex;
        const actualStart = start < end ? start : end;
        const actualEnd = end > start ? end : start;

        // edge case: it's possible that the user selected start/end so that it overlaps
        // another range which got previously selected. Remove such ranges
        currentJudgementPair!.annotatedRanges = currentJudgementPair!.annotatedRanges.filter(
          (range) => !(range.start >= actualStart && range.end <= actualEnd),
        );

        // then, add new range to the annotated ranges, and clear current annotation start
        currentJudgementPair!.annotatedRanges.push({
          start: actualStart,
          end: actualEnd,
        });
        currentJudgementPair!.currentAnnotationStart = undefined;
      }
    })
    .addCase(deleteRange, (state, action) => {
      const currentJudgementPair = state.judgementPairs.find(
        (pair) => pair.id === state.currentJudgementPairId,
      );
      currentJudgementPair!.annotatedRanges = currentJudgementPair!.annotatedRanges.filter(
        (range) => {
          return !(
            action.payload.annotationPartIndex >= range.start &&
            action.payload.annotationPartIndex <= range.end
          );
        },
      );
    })
    .addCase(setJudgementStatus, (state, action) => {
      const judgementPair = state.judgementPairs.find((pair) => pair.id === action.payload.id);
      judgementPair!.status = action.payload.status;
    })
    .addCase(selectJudgementPair, (state, action) => {
      if (state.currentJudgementPairId !== action.payload?.id) {
        state.currentJudgementPairId = action.payload?.id;
        state.currentJudgementPairSelectedOnMs = new Date().getTime();
      }
    })
    .addCase(userActions.logout, () => {
      // on logout, erase annotation state
      return INITIAL_STATE;
    }),
);

function areJudgementPairsEqual(jp1: PreloadJudgement, jp2: PreloadJudgement) {
  return (
    jp1.queryText === jp2.queryText &&
    jp1.docAnnotationParts.length === jp2.docAnnotationParts.length &&
    !jp1.docAnnotationParts.some((part, index) => jp2.docAnnotationParts[index] !== part)
  );
}

export const actions = {
  preloadJudgements,
  rateJudgementPair,
  selectRangeStartEnd,
  deleteRange,
  setJudgementStatus,
  selectJudgementPair,
};
export default reducer;
