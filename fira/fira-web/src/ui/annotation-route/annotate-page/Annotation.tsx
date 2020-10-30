import React, { useState, useRef } from 'react';

import styles from './Annotation.module.css';
import { RateLevels } from '../../../typings/enums';
import { RelevanceLevel, JudgementMode, functions } from '../../../../../fira-commons';
import { judgementStories } from '../../../stories/judgement.stories';
import Button from '../../elements/Button';
import { useKeyupEvent as useKeyupHandler } from '../../util/events.hooks';
import RateButton from './RateButton';
import {
  useAnnotationState,
  useAnnotationActions,
} from '../../../state/annotation/annotation.hooks';
import AnnotationPart from './AnnotationPart';
import JustifiedText from '../../layouts/JustifiedText';
import Menu from '../../elements/Menu';
import Line from '../../elements/Line';

const WHITESPACE = ' ';

const AnnotationShell: React.FC<{
  finishedFraction: number;
  hideTooltip?: () => void;
  userSelectionAllowed?: boolean;
  annotateOnUserSelect?: () => void;
  queryComponent?: React.ReactNode;
  documentComponent?: React.ReactNode;
  guideComponent?: React.ReactNode;
  documentComponentRef?: React.RefObject<HTMLDivElement>;
}> = ({
  finishedFraction,
  hideTooltip,
  userSelectionAllowed,
  annotateOnUserSelect,
  queryComponent,
  documentComponent,
  guideComponent,
  documentComponentRef,
}) => {
  return (
    <>
      <div
        style={{ '--finished-fraction': `${finishedFraction}%` } as any}
        className={styles.progressBar}
      />
      <div className={styles.container} onClickCapture={hideTooltip}>
        <div className={styles.actionBar}>{queryComponent}</div>
        <Line orientation="horizontal" />
        <div
          ref={documentComponentRef}
          className={`${styles.annotationArea} ${
            !userSelectionAllowed && styles.noUserSelectionAllowed
          }`}
          onMouseUp={annotateOnUserSelect}
        >
          {documentComponent}
        </div>
        <div className={styles.footer}>{guideComponent}</div>
      </div>
    </>
  );
};

const Annotation: React.FC = () => {
  const { remainingToFinish, alreadyFinished, currentJudgementPair } = useAnnotationState();
  const { selectRange, deleteRange } = useAnnotationActions();
  const [tooltipAnnotatePartIndex, setTooltipAnnotatePartIndex] = useState<number | undefined>(
    undefined,
  );
  const documentComponentRef = useRef<HTMLDivElement>(null);

  function createJudgementFn(relevanceLevel: RelevanceLevel) {
    return () => judgementStories.rateJudgementPair(relevanceLevel);
  }

  // create map which is used to rate judgement pairs with keyboard keys
  const keyupMap: { [keyCode: string]: () => void } = {};
  for (const rateLevel of Object.values(RateLevels)) {
    if (rateLevel.enabled) {
      keyupMap[rateLevel.keyboardKey.keyCode] = createJudgementFn(rateLevel.relevanceLevel);
    }
  }

  useKeyupHandler(!currentJudgementPair ? {} : keyupMap);

  // compute fraction of finished annotation; used for progress bar
  let finishedFraction;
  if (remainingToFinish === undefined || alreadyFinished === undefined) {
    finishedFraction = 0;
  } else {
    finishedFraction =
      remainingToFinish === undefined
        ? 0
        : (alreadyFinished / (remainingToFinish + alreadyFinished)) * 100;
    if (finishedFraction > 100) {
      // user annotated more than his annotation target --> cap at 100%
      finishedFraction = 100;
    }
  }

  if (!currentJudgementPair || remainingToFinish === undefined) {
    return <AnnotationShell finishedFraction={finishedFraction} />;
  }

  const currentRateLevel =
    currentJudgementPair.relevanceLevel === undefined
      ? undefined
      : RateLevels[currentJudgementPair.relevanceLevel];

  // compute some boolean variables needed to guide the user throw the annotation process
  const ratingRequired = !currentRateLevel;
  const currentSelectionNotFinished = currentJudgementPair.currentAnnotationStart !== undefined;
  const annotationIsAllowedInGeneral =
    currentJudgementPair.mode === JudgementMode.SCORING_AND_SELECT_SPANS;
  const annotationIsRequired =
    annotationIsAllowedInGeneral &&
    !!currentRateLevel?.annotationRequired &&
    currentJudgementPair.annotatedRanges.length === 0;
  const annotationStatus =
    currentRateLevel?.relevanceLevel === RelevanceLevel.MISLEADING_ANSWER
      ? annotationIsRequired
        ? 'MISLEADING_REGION_REQUIRED'
        : 'ADDITIONAL_MISLEADING_REGIONS_ALLOWED'
      : annotationIsRequired
      ? 'RELEVANT_REGION_REQUIRED'
      : 'ADDITIONAL_RELEVANT_REGIONS_ALLOWED';
  const userSelectionAllowed = currentJudgementPair.currentAnnotationStart === undefined;

  function hideTooltip() {
    setTooltipAnnotatePartIndex(undefined);
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
    <>
      <AnnotationShell
        finishedFraction={finishedFraction}
        hideTooltip={hideTooltip}
        userSelectionAllowed={userSelectionAllowed}
        annotateOnUserSelect={annotateOnUserSelect}
        queryComponent={
          <>
            <div className={styles.queryText}>{currentJudgementPair.queryText}</div>
            <Menu
              additionalInfo={
                <span>
                  Finished <strong>{alreadyFinished}</strong> <br /> out of{' '}
                  <strong>{alreadyFinished! + remainingToFinish}</strong>
                </span>
              }
            />
          </>
        }
        documentComponentRef={documentComponentRef}
        documentComponent={
          <JustifiedText
            text={currentJudgementPair.docAnnotationParts}
            parentContainerRef={documentComponentRef}
            createTextNode={({ textPart, partIdx }) => {
              // determine if part is in one of the selected ranges
              const correspondingAnnotatedRange = currentJudgementPair.annotatedRanges.find(
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
                currentJudgementPair.mode === JudgementMode.SCORING_AND_SELECT_SPANS &&
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
                  isRangeStart={currentJudgementPair.currentAnnotationStart === partIdx}
                  isInSelectedRange={isInAnnotatedRange}
                  showTooltip={tooltipAnnotatePartIndex === partIdx}
                  annotationIsAllowedOnPart={canAnnotatePart}
                  annotationIsAllowedInGeneral={annotationIsAllowedInGeneral}
                  onPartClick={
                    canAnnotatePart
                      ? () =>
                          selectRange({
                            selection: { type: 'START_OR_END', annotationPartIndex: partIdx },
                          })
                      : isInAnnotatedRange
                      ? () => setTooltipAnnotatePartIndex(partIdx)
                      : functions.noop
                  }
                  onTooltipClick={() => {
                    deleteRange({ annotationPartIndex: partIdx });
                    hideTooltip();
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
                  rateLevel={rateLevel}
                  onClick={createJudgementFn(rateLevel.relevanceLevel)}
                />
              ))
          ) : (
            <>
              <span className={styles.guideText}>
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
              </span>
              <Button
                buttonType="primary"
                className={styles.nextButton}
                disabled={currentSelectionNotFinished || annotationIsRequired}
                onClick={() => judgementStories.submitCurrentJudgement()}
              >
                Next
              </Button>
            </>
          )
        }
      />
    </>
  );
};

export default Annotation;
