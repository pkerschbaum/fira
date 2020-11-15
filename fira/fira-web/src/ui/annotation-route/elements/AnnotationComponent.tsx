import React, { useState, useRef, useEffect } from 'react';
import { Box, Divider, Skeleton } from '@material-ui/core';

import Button from '../../elements/Button';
import TextBox from '../../elements/TextBox';
import Stack from '../../layouts/Stack';
import JustifiedText from '../../layouts/JustifiedText';
import RateButton from './RateButton';
import AnnotationPart from './AnnotationPart';
import { useAnnotationState } from './AnnotationComponent.hooks';
import { useKeyupHandler } from '../../util/events.hooks';
import { RateLevels } from '../../../typings/enums';
import { CustomError } from '../../../commons/custom-error';
import { functions, judgementsSchema } from '../../../../../fira-commons';

import { styles } from './AnnotationComponent.styles';
import { commonStyles } from '../../Common.styles';

const WHITESPACE = ' ';

export type SubmitPayload = {
  id: number;
  relevanceLevel: judgementsSchema.RelevanceLevel;
  annotatedRanges: Array<{ start: number; end: number }>;
  judgementStartedMs: number;
};

const AnnotationComponent: React.FC<{
  judgementPair?: judgementsSchema.PreloadJudgement;
  finishedFraction: number;
  menuComponents: React.ReactNode;
  submitJudgement: (data: SubmitPayload) => void;
  autoSubmit: boolean;
}> = ({ judgementPair, finishedFraction, menuComponents, submitJudgement, autoSubmit }) => {
  const {
    state,
    rateJudgementPair,
    selectRange,
    deleteRange,
    startJudgement,
  } = useAnnotationState();
  const [popoverAnnotatePartIndex, setPopoverAnnotatePartIndex] = useState<number | undefined>(
    undefined,
  );
  const documentComponentRef = useRef<HTMLDivElement>(null);

  // once a judgement pair is given to the component, or the judgement pair changes, reset judgementStartedMs
  useEffect(() => {
    if (judgementPair !== undefined) {
      startJudgement();
    }
  }, [judgementPair, startJudgement]);

  // if autoSubmit is enabled and submission of judgement pair is possible, do that
  useEffect(() => {
    if (
      autoSubmit &&
      judgementPair !== undefined &&
      state.relevanceLevel !== undefined &&
      state.judgementStartedMs !== undefined
    ) {
      const currentRateLevel = RateLevels[state.relevanceLevel];

      // if the chosen rate level does not require annotation, or it does and regions were
      // annotated already when the pair was rated, immediately submit judgement
      if (!currentRateLevel.annotationRequired || state.annotatedRangesExistedWhenRated) {
        submitJudgement({
          id: judgementPair.id,
          relevanceLevel: state.relevanceLevel,
          annotatedRanges: state.annotatedRanges,
          judgementStartedMs: state.judgementStartedMs,
        });
      }
    }
  }, [
    autoSubmit,
    judgementPair,
    state.relevanceLevel,
    state.judgementStartedMs,
    state.annotatedRanges,
    state.annotatedRangesExistedWhenRated,
    submitJudgement,
  ]);

  // create map which is used to rate judgement pairs with keyboard keys
  const keyupMap: { [keyCode: string]: () => void } = {};
  for (const rateLevel of Object.values(RateLevels)) {
    if (rateLevel.enabled) {
      keyupMap[rateLevel.keyboardKey.keyCode] = () =>
        rateJudgementPair({
          relevanceLevel: rateLevel.relevanceLevel,
        });
    }
  }
  useKeyupHandler(!judgementPair ? {} : keyupMap);

  if (!judgementPair) {
    // judgement pair is currently getting loaded from server --> show annotation shell in loading state
    return <AnnotationShell finishedFraction={finishedFraction} />;
  }

  const currentRateLevel =
    state.relevanceLevel === undefined ? undefined : RateLevels[state.relevanceLevel];

  // compute some boolean variables needed to guide the user throw the annotation process
  const ratingRequired = !currentRateLevel;
  const currentSelectionNotFinished = state.currentAnnotationStart !== undefined;
  const annotationIsAllowedInGeneral =
    judgementPair.mode === judgementsSchema.JudgementMode.SCORING_AND_SELECT_SPANS;
  const annotationIsRequired =
    annotationIsAllowedInGeneral &&
    !!currentRateLevel?.annotationRequired &&
    state.annotatedRanges.length === 0;
  const annotationStatus =
    currentRateLevel?.relevanceLevel === judgementsSchema.RelevanceLevel.MISLEADING_ANSWER
      ? annotationIsRequired
        ? 'MISLEADING_REGION_REQUIRED'
        : 'ADDITIONAL_MISLEADING_REGIONS_ALLOWED'
      : annotationIsRequired
      ? 'RELEVANT_REGION_REQUIRED'
      : 'ADDITIONAL_RELEVANT_REGIONS_ALLOWED';
  const userSelectionAllowed = state.currentAnnotationStart === undefined;

  function hidePopover() {
    setPopoverAnnotatePartIndex(undefined);
  }

  function annotateOnUserSelect() {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (!anchorNode || !focusNode) {
      return;
    }

    let currentNode: Node | (Node & ParentNode) | null = anchorNode;
    let anchorIdx: string | undefined;
    while (currentNode) {
      if ((currentNode as any).dataset?.idx) {
        anchorIdx = (currentNode as any).dataset.idx;
        break;
      }
      currentNode = currentNode.parentNode;
    }
    if (!anchorIdx) {
      // no anchor, i.e. start of selection, found
      // --> stop
      return;
    }

    currentNode = focusNode;
    let focusIdx: string | undefined;
    while (currentNode) {
      if ((currentNode as any).dataset?.idx) {
        focusIdx = (currentNode as any).dataset.idx;
        break;
      }
      currentNode = currentNode.parentNode;
    }
    if (!focusIdx) {
      // no focus, i.e. end of selection, found
      // --> stop
      return;
    }

    // idX got extracted --> remove user selection
    window.getSelection()?.empty();

    // if anchorIdx and focusIdx are the same, it was likely just a click on an element
    // --> stop
    if (anchorIdx === focusIdx) {
      return;
    }

    // both anchorIdx and focusIdx found --> add annotation
    selectRange({
      selection: {
        type: 'ENTIRE_RANGE',
        partStartIndex: Number(anchorIdx),
        partEndIndex: Number(focusIdx),
      },
    });
  }

  return (
    <AnnotationShell
      finishedFraction={finishedFraction}
      hidePopover={hidePopover}
      userSelectionAllowed={userSelectionAllowed}
      annotateOnUserSelect={annotateOnUserSelect}
      queryComponent={
        <>
          <TextBox bold>{judgementPair.queryText}</TextBox>
          {menuComponents}
        </>
      }
      documentComponentRef={documentComponentRef}
      documentComponent={
        <JustifiedText
          text={judgementPair.docAnnotationParts}
          parentContainerRef={documentComponentRef}
          createTextNode={({ textPart, partIdx }) => {
            // determine if part is in one of the selected ranges
            const correspondingAnnotatedRange = state.annotatedRanges.find(
              (range) => range.start <= partIdx && range.end >= partIdx,
            );
            const isInAnnotatedRange = !!correspondingAnnotatedRange;
            /*
             * annotation of a part is allowed if
             * - the corresponding judgement mode is set,
             * - it is no whitespace
             * - and the part is not already part of a selected region
             */
            const canAnnotatePart =
              judgementPair.mode === judgementsSchema.JudgementMode.SCORING_AND_SELECT_SPANS &&
              textPart !== WHITESPACE &&
              !isInAnnotatedRange;

            /*
             * now render two things:
             * - the main annotation part which shows the actual text.
             * - a second annotation part which is only a placeholder. This placeholder will
             *   use the horizontal space remaining in the line of text. Essentially, this
             *   placeholder creates a justified layout for the text (i.e. a "Blocksatz" layout,
             *   as it is called in german)
             *
             * Why use a placeholder, instead of just spreading out the parts via the parent container (e.g.,
             * justify-content: space-between)? Well, imagine the user annotated a range containing of multiple words.
             * Then, we want to highlight the entire range, e.g. with a background color.
             * If we would let the parent container take care of spreading out the text parts, there would be empty space
             * in between which is not highlighted like the text. So we need something which we can apply styles onto.
             * The placeholders enable to apply styles on them, e.g. give them the same green background color like the
             * annotated text parts.
             */
            return (
              <AnnotationPart
                key={partIdx}
                idx={`${partIdx}`}
                text={textPart}
                isRangeStart={state.currentAnnotationStart === partIdx}
                isInSelectedRange={isInAnnotatedRange}
                showPopover={popoverAnnotatePartIndex === partIdx}
                annotationIsAllowedOnPart={canAnnotatePart}
                annotationIsAllowedInGeneral={annotationIsAllowedInGeneral}
                onPartClick={
                  canAnnotatePart
                    ? () =>
                        selectRange({
                          selection: {
                            type: 'START_OR_END',
                            docAnnotationParts: judgementPair.docAnnotationParts,
                            annotationPartIndex: partIdx,
                          },
                        })
                    : isInAnnotatedRange
                    ? () => setPopoverAnnotatePartIndex(partIdx)
                    : functions.noop
                }
                onPopoverClick={() => {
                  deleteRange({ annotationPartIndex: partIdx });
                  hidePopover();
                }}
              />
            );
          }}
        />
      }
      guideComponent={
        ratingRequired ? (
          Object.values(RateLevels)
            .filter((rateLevel) => rateLevel.enabled)
            .map((rateLevel) => (
              <RateButton
                key={rateLevel.relevanceLevel}
                css={styles.rateButton}
                relevanceLevel={rateLevel.relevanceLevel}
                keyboardKeyToShow={rateLevel.keyboardKey.toShow}
                onClick={() =>
                  rateJudgementPair({
                    relevanceLevel: rateLevel.relevanceLevel,
                  })
                }
              />
            ))
        ) : (
          <>
            <TextBox
              css={[commonStyles.flex.shrinkAndFitHorizontal, commonStyles.grid.verticalCenter]}
            >
              {currentSelectionNotFinished ? (
                <>Finish your selection</>
              ) : annotationStatus === 'RELEVANT_REGION_REQUIRED' ? (
                <>Please select the relevant regions of the document.</>
              ) : annotationStatus === 'MISLEADING_REGION_REQUIRED' ? (
                <>Please select the misleading regions of the document.</>
              ) : annotationStatus === 'ADDITIONAL_RELEVANT_REGIONS_ALLOWED' ? (
                <>Feel free to add more relevant regions or go to the next judgement pair.</>
              ) : (
                <>Feel free to add more misleading regions or go to the next judgement pair.</>
              )}
            </TextBox>
            <Button
              variant="contained"
              css={styles.nextButton}
              disabled={currentSelectionNotFinished || annotationIsRequired}
              onClick={() => {
                if (
                  judgementPair === undefined ||
                  state.relevanceLevel === undefined ||
                  state.judgementStartedMs === undefined
                ) {
                  throw new CustomError(
                    `judgemenPair cannot be submitted, current annotation state is`,
                    { judgementPair, state },
                  );
                }

                submitJudgement({
                  id: judgementPair.id,
                  relevanceLevel: state.relevanceLevel,
                  annotatedRanges: state.annotatedRanges,
                  judgementStartedMs: state.judgementStartedMs,
                });
              }}
            >
              Next
            </Button>
          </>
        )
      }
    />
  );
};

const AnnotationShell: React.FC<{
  finishedFraction: number;
  hidePopover?: () => void;
  userSelectionAllowed?: boolean;
  annotateOnUserSelect?: () => void;
  queryComponent?: React.ReactNode;
  documentComponent?: React.ReactNode;
  guideComponent?: React.ReactNode;
  documentComponentRef?: React.RefObject<HTMLDivElement>;
}> = ({
  finishedFraction,
  hidePopover,
  userSelectionAllowed,
  annotateOnUserSelect,
  queryComponent,
  documentComponent,
  guideComponent,
  documentComponentRef,
}) => (
  <>
    <Box
      style={{ '--finished-fraction': `${finishedFraction}%` } as any}
      css={styles.progressBar}
    />
    <Stack
      alignItems="stretch"
      css={(styles.container, commonStyles.fullHeight)}
      boxProps={{ onClickCapture: hidePopover }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        disableContainerStretch
        css={styles.actionBar}
      >
        {queryComponent ?? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            css={[styles.actionBarSkeleton, commonStyles.fullWidth]}
          />
        )}
      </Stack>
      <Divider css={styles.divider} />
      <Stack
        alignItems="flex-start"
        ref={documentComponentRef}
        css={[styles.annotationArea, !userSelectionAllowed && commonStyles.noUserSelectionAllowed]}
        boxProps={{ onMouseUp: annotateOnUserSelect }}
      >
        {documentComponent ?? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            css={[styles.annotationAreaSkeleton, commonStyles.fullWidth, commonStyles.fullHeight]}
          />
        )}
      </Stack>
      <Box css={styles.footer}>{guideComponent}</Box>
    </Stack>
  </>
);

export default AnnotationComponent;
