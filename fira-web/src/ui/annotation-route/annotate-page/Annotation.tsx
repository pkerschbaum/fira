import React, { useState } from 'react';

import styles from './Annotation.module.css';
import { RelevanceLevel, RateLevels, JudgementMode } from '../../../typings/enums';
import { judgementStories } from '../../../stories/judgement.stories';
import { noop } from '../../../util/functions';
import Button from '../../elements/Button';
import { useKeyupEvent as useKeyupHandler } from '../../util/events.hooks';
import RateButton from './RateButton';
import { JudgementPair } from '../../../store/annotation/annotation.slice';
import AnnotationPart from './AnnotationPart';
import Menu from '../../elements/Menu';
import Line from '../../elements/Line';

const Annotation: React.FC<{
  currentJudgementPair: JudgementPair;
  remainingToFinish: number;
  alreadyFinished: number;
  selectRangeStartEnd: ({ annotationPartIndex }: { annotationPartIndex: number }) => void;
  deleteRange: ({ annotationPartIndex }: { annotationPartIndex: number }) => void;
}> = ({
  currentJudgementPair,
  remainingToFinish,
  alreadyFinished,
  selectRangeStartEnd,
  deleteRange,
}) => {
  const [tooltipAnnotatePartIndex, setTooltipAnnotatePartIndex] = useState<number | undefined>(
    undefined,
  );

  function createJudgementFn(relevanceLevel: RelevanceLevel) {
    return () => judgementStories.rateJudgementPair(relevanceLevel);
  }

  useKeyupHandler({
    Digit1: createJudgementFn(RelevanceLevel.NOT_RELEVANT),
    Digit2: createJudgementFn(RelevanceLevel.MISLEADING_ANSWER),
    Digit3: createJudgementFn(RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER),
    Digit4: createJudgementFn(RelevanceLevel.GOOD_ANSWER),
    Digit5: createJudgementFn(RelevanceLevel.PERFECT_ANSWER),
  });

  const currentRateLevel = RateLevels.find(
    rateLevel => rateLevel.relevanceLevel === currentJudgementPair.relevanceLevel,
  );

  // compute fraction of finished annotation; used for progress bar
  const annotationTarget = remainingToFinish + alreadyFinished;
  const finishedFraction = (alreadyFinished / annotationTarget) * 100;

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

  function hideTooltip() {
    setTooltipAnnotatePartIndex(undefined);
  }

  return (
    <>
      {finishedFraction !== undefined && (
        <div style={{ width: `${finishedFraction}%` }} className={styles.progressBar} />
      )}
      <div className={styles.container} onClickCapture={hideTooltip}>
        <div className={styles.actionBar}>
          <div className={styles.queryText}>{currentJudgementPair.queryText}</div>
          <Menu />
        </div>
        <Line orientation="horizontal" />
        <div key={currentJudgementPair.id} className={styles.annotationArea}>
          {currentJudgementPair.docAnnotationParts.map((annotationPart, partIdx) => {
            // determine if part is in one of the selected ranges
            const correspondingAnnotatedRange = currentJudgementPair.annotatedRanges.find(
              range => range.start <= partIdx && range.end >= partIdx,
            );
            const isInAnnotatedRange = !!correspondingAnnotatedRange;
            const isLastInAnnotatedRange =
              !!correspondingAnnotatedRange && partIdx === correspondingAnnotatedRange.end;

            /*
             * annotation of a part is allowed if
             * - the corresponding judgement mode is set,
             * - it is no whitespace
             * - and the part is not already part of a selected region
             */
            const canAnnotatePart =
              currentJudgementPair.mode === JudgementMode.SCORING_AND_SELECT_SPANS &&
              annotationPart !== ' ' &&
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
              <>
                <AnnotationPart
                  key={partIdx}
                  text={annotationPart}
                  isRangeStart={currentJudgementPair.currentAnnotationStart === partIdx}
                  isInSelectedRange={isInAnnotatedRange}
                  showTooltip={tooltipAnnotatePartIndex === partIdx}
                  annotationIsAllowedOnPart={canAnnotatePart}
                  annotationIsAllowedInGeneral={annotationIsAllowedInGeneral}
                  onPartClick={
                    canAnnotatePart
                      ? () => selectRangeStartEnd({ annotationPartIndex: partIdx })
                      : isInAnnotatedRange
                      ? () => setTooltipAnnotatePartIndex(partIdx)
                      : noop
                  }
                  onTooltipClick={() => {
                    deleteRange({ annotationPartIndex: partIdx });
                    hideTooltip();
                  }}
                />
                <AnnotationPart
                  key={'placeholder' + partIdx}
                  text=""
                  isInSelectedRange={isInAnnotatedRange && !isLastInAnnotatedRange}
                  annotationIsAllowedInGeneral={annotationIsAllowedInGeneral}
                  isPlaceholder={true}
                  onPartClick={
                    canAnnotatePart
                      ? () => selectRangeStartEnd({ annotationPartIndex: partIdx })
                      : isInAnnotatedRange
                      ? () => setTooltipAnnotatePartIndex(partIdx)
                      : noop
                  }
                  onTooltipClick={() => {
                    deleteRange({ annotationPartIndex: partIdx });
                    hideTooltip();
                  }}
                />
              </>
            );
          })}
        </div>
        <div className={styles.footer}>
          {ratingRequired ? (
            RateLevels.map(rateButton => (
              <RateButton
                key={rateButton.relevanceLevel}
                rateLevel={rateButton}
                onClick={createJudgementFn(rateButton.relevanceLevel)}
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
                style={{ width: '60px', height: '50px' }}
                disabled={currentSelectionNotFinished || annotationIsRequired}
                onClick={() => judgementStories.submitCurrentJudgement()}
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Annotation;
