import React, { useState } from 'react';

import styles from './Annotation.module.css';
import { RelevanceLevel, RateLevels, JudgementMode } from '../../typings/enums';
import { judgementsService } from '../../judgements/judgements.service';
import { noop } from '../../util/functions';
import Button from '../elements/Button';
import { useKeyupEvent as useKeyupHandler } from '../util/events.hooks';
import RateButton from './RateButton';
import { JudgementPair } from '../../store/annotation/annotation.slice';
import AnnotationPart from './AnnotationPart';
import Menu from '../elements/Menu';
import Line from '../elements/Line';

const Annotation: React.FC<{
  currentJudgementPair: JudgementPair;
  remainingToFinish: number;
  alreadyFinished: number;
  selectRangeStartEnd: ({ annotationPartIndex }: { annotationPartIndex: number }) => void;
  deleteRange: ({ annotationPartIndex }: { annotationPartIndex: number }) => void;
  rateJudgementPair: ({ relevanceLevel }: { relevanceLevel: RelevanceLevel }) => void;
}> = ({
  currentJudgementPair,
  remainingToFinish,
  alreadyFinished,
  selectRangeStartEnd,
  deleteRange,
  rateJudgementPair,
}) => {
  const [tooltipAnnotatePartIndex, setTooltipAnnotatePartIndex] = useState<number | undefined>(
    undefined,
  );

  useKeyupHandler({
    Digit1: () => rateJudgementPair({ relevanceLevel: RelevanceLevel.MISLEADING_ANSWER }),
    Digit2: () => rateJudgementPair({ relevanceLevel: RelevanceLevel.NOT_RELEVANT }),
    Digit3: () =>
      rateJudgementPair({
        relevanceLevel: RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER,
      }),
    Digit4: () => rateJudgementPair({ relevanceLevel: RelevanceLevel.GOOD_ANSWER }),
    Digit5: () => rateJudgementPair({ relevanceLevel: RelevanceLevel.PERFECT_ANSWER }),
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
  const annotationIsRequired =
    currentJudgementPair.mode === JudgementMode.SCORING_AND_SELECT_SPANS &&
    !!currentRateLevel?.annotationRequired &&
    currentJudgementPair.annotatedRanges.length === 0;

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
          {currentJudgementPair.docAnnotationParts.map((annotationPart, i) => {
            // determine if part is in one of the selected ranges
            const isInSelectedRange = currentJudgementPair.annotatedRanges.some(
              range => range.start <= i && range.end >= i,
            );

            // annotation is allowed if the corresponding judgement mode is set,
            // and the current rate level explicitly requires it
            const annotationIsAllowed =
              currentJudgementPair.mode === JudgementMode.SCORING_AND_SELECT_SPANS &&
              !!currentRateLevel?.annotationRequired;

            const canAnnotatePart = annotationIsAllowed && !isInSelectedRange;

            return (
              <AnnotationPart
                key={i}
                text={annotationPart}
                isRangeStart={currentJudgementPair.currentAnnotationStart === i}
                isInSelectedRange={isInSelectedRange}
                showTooltip={tooltipAnnotatePartIndex === i}
                annotationIsAllowed={annotationIsAllowed}
                onPartClick={
                  canAnnotatePart
                    ? () => selectRangeStartEnd({ annotationPartIndex: i })
                    : isInSelectedRange
                    ? () => setTooltipAnnotatePartIndex(i)
                    : noop
                }
                onTooltipClick={() => {
                  deleteRange({ annotationPartIndex: i });
                  hideTooltip();
                }}
              />
            );
          })}
        </div>
        <div className={styles.footer}>
          {ratingRequired ? (
            RateLevels.map(rateButton => (
              <RateButton
                key={rateButton.relevanceLevel}
                rateLevel={rateButton}
                onClick={() => judgementsService.rateJudgementPair(rateButton.relevanceLevel)}
              />
            ))
          ) : (
            <>
              <span className={styles.guideText}>
                {currentSelectionNotFinished ? (
                  <>Finish your selection</>
                ) : annotationIsRequired ? (
                  <>Please select the relevant regions of the document.</>
                ) : (
                  <>Feel free to add more relevant regions or go to the next judgement pair.</>
                )}
              </span>
              <Button
                buttonType="primary"
                style={{ width: '60px', height: '50px' }}
                disabled={currentSelectionNotFinished || annotationIsRequired}
                onClick={() => judgementsService.submitCurrentJudgement()}
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
