import { useMemo } from 'react';
import { useImmerReducer, Reducer } from 'use-immer';

import { RateLevels } from '../../../typings/enums';
import { judgementsSchema, assertUnreachable } from '../../../../../fira-commons';

type RateJudgementPairAction = {
  type: 'JUDGEMENT_PAIR_RATED';
  payload: {
    relevanceLevel: judgementsSchema.RelevanceLevel;
  };
};

type SelectRangeAction = {
  type: 'RANGE_SELECTED';
  payload: {
    selection:
      | {
          type: 'START_OR_END';
          docAnnotationParts: judgementsSchema.PreloadJudgement['docAnnotationParts'];
          annotationPartIndex: number;
        }
      | {
          type: 'ENTIRE_RANGE';
          partStartIndex: number;
          partEndIndex: number;
        };
  };
};

type DeleteRangeAction = {
  type: 'RANGE_DELETED';
  payload: {
    annotationPartIndex: number;
  };
};

type StartJudgementAction = {
  type: 'JUDGEMENT_STARTED';
};

type AnnotationState = {
  relevanceLevel?: judgementsSchema.RelevanceLevel;
  annotatedRanges: Array<{ start: number; end: number }>;
  annotatedRangesExistedWhenRated: boolean;
  currentAnnotationStart?: number;
  judgementStartedMs?: number;
};

const annotationStateReducer: Reducer<
  AnnotationState,
  RateJudgementPairAction | SelectRangeAction | DeleteRangeAction | StartJudgementAction
> = (state, action) => {
  switch (action.type) {
    case 'JUDGEMENT_PAIR_RATED': {
      const newRelevanceLevel = action.payload.relevanceLevel;
      state.relevanceLevel = newRelevanceLevel;

      // clear annotated ranges and current annotation start if
      // rating is changed to a level which does not require annotation of ranges
      const currentRateLevel = RateLevels[newRelevanceLevel];
      if (!currentRateLevel.annotationRequired) {
        state.annotatedRanges = [];
        state.currentAnnotationStart = undefined;
      }

      // set flag if annotated ranges exist, this is used for autoSubmit functionality
      state.annotatedRangesExistedWhenRated = state.annotatedRanges.length > 0;

      break;
    }

    case 'RANGE_SELECTED': {
      let start: number;
      let end: number;

      if (action.payload.selection.type === 'START_OR_END') {
        if (state.currentAnnotationStart === undefined) {
          // the start of an annotation range was selected
          // if the user selected a whitespace, start the selection at the next word
          let selectedPartIdx = action.payload.selection.annotationPartIndex;
          if (action.payload.selection.docAnnotationParts[selectedPartIdx] === ' ') {
            selectedPartIdx++;
          }

          state.currentAnnotationStart = selectedPartIdx;
          return;
        } else {
          // the end of an annotation range was selected --> save the annotated range
          // if the user selected a whitespace, end the selection at the previous word
          let selectedPartIdx = action.payload.selection.annotationPartIndex;
          if (action.payload.selection.docAnnotationParts[selectedPartIdx] === ' ') {
            selectedPartIdx--;
          }

          start = state.currentAnnotationStart;
          end = selectedPartIdx;
        }
      } else if (action.payload.selection.type === 'ENTIRE_RANGE') {
        start = action.payload.selection.partStartIndex;
        end = action.payload.selection.partEndIndex;
      } else {
        assertUnreachable(action.payload.selection);
      }

      const actualStart = start < end ? start : end;
      const actualEnd = end > start ? end : start;

      // edge case: avoid overlapping ranges
      const overlapping = state.annotatedRanges.some(
        (range) =>
          (actualStart >= range.start && actualStart <= range.end) ||
          (actualEnd >= range.start && actualEnd <= range.end),
      );
      if (overlapping) {
        return;
      }

      // edge case: it's possible that the user selected start/end so that it overlaps
      // another range which got previously selected. Remove such ranges
      state.annotatedRanges = state.annotatedRanges.filter(
        (range) => !(range.start >= actualStart && range.end <= actualEnd),
      );

      // then, add new range to the annotated ranges, and clear current annotation start
      state.annotatedRanges.push({
        start: actualStart,
        end: actualEnd,
      });
      state.currentAnnotationStart = undefined;

      break;
    }

    case 'RANGE_DELETED': {
      state.annotatedRanges = state.annotatedRanges.filter((range) => {
        return !(
          action.payload.annotationPartIndex >= range.start &&
          action.payload.annotationPartIndex <= range.end
        );
      });
      break;
    }

    case 'JUDGEMENT_STARTED': {
      state.judgementStartedMs = Date.now();
      break;
    }

    default:
      assertUnreachable(action);
  }
};

export const useAnnotationState = () => {
  const [state, dispatch] = useImmerReducer(annotationStateReducer, {
    annotatedRanges: [],
    annotatedRangesExistedWhenRated: false,
  });
  const actions = useMemo(
    () => ({
      rateJudgementPair: (payload: RateJudgementPairAction['payload']) => {
        dispatch({ type: 'JUDGEMENT_PAIR_RATED', payload });
      },
      selectRange: (payload: SelectRangeAction['payload']) => {
        dispatch({ type: 'RANGE_SELECTED', payload });
      },
      deleteRange: (payload: DeleteRangeAction['payload']) => {
        dispatch({ type: 'RANGE_DELETED', payload });
      },
      startJudgement: () => {
        dispatch({ type: 'JUDGEMENT_STARTED' });
      },
    }),
    [dispatch],
  );

  return {
    state,
    ...actions,
  };
};
